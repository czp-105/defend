import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import G6, { Graph, IGroup, IShape, ModelConfig } from '@antv/g6';
import {
  CIIO_G6_SANDBOX_TOPOLOGIES,
  getG6SandboxTopologyByUnit,
  UnitSandboxTopologyBundle,
  SandboxDeviceKind,
  AssetRingStatus,
} from '../../data/g6SandboxTopologyData';
import { RotateCcw, Maximize2, Building2, MapPin } from 'lucide-react';

export interface LayeredTopologyViewProps {
  defenseSystems?: Array<{
    id: string;
    name: string;
    mode: '串联' | '旁路' | '终端代理' | '接口';
    version: string;
    isProbeFailed?: boolean;
    status: 'online' | 'warning' | 'offline';
  }>;
  selectedCiioUnitId?: string;
  onSelectCiioUnit?: (unitId: string) => void;
  onBackToMap?: () => void;
  onSelectSystem?: (dsId: string) => void;
  onSwitchToBaseline?: () => void;
}

// 确保自定义 G6 节点与边只注册一次
let isG6SandboxRegistered = false;

function registerG6SandboxElements() {
  if (isG6SandboxRegistered) return;
  isG6SandboxRegistered = true;

  /**
   * 1. 注册 2.5D 矢量自定义节点：sandbox-25d-node
   * 支持：
   * - 核心路由器 (router)：2.5D 立体圆盘路由网关 + 四向流光箭头
   * - 边界防火墙/WAF (ngfw / waf)：2.5D 立体网关底座 + 立体盾牌造型 + 阶段1红色护盾闪烁与拦截浮窗
   * - 安全隔离网闸/IDS (gatekeeper / ids)：2.5D 双总线隔离网闸 / 棱镜探针造型
   * - 底层安全域资产 (server / database / terminal / plc)：
   *   刀片服务器 / 三层圆柱数据库 / 终端工作站 / 2.5D 工业PLC与硬件加密控制卡
   *   + 底部发光状态光环 (绿=安全, 橙=探测中, 红闪=已失陷 + 右上角「! 已失陷」角标)
   */
  G6.registerNode(
    'sandbox-25d-node',
    {
      draw(cfg: ModelConfig, group: IGroup): IShape {
        const deviceKind = (cfg.deviceKind as SandboxDeviceKind) || 'server';
        const boundaryLayer = (cfg.boundaryLayer as string) || 'tier3-asset';
        const ringStatus = (cfg.ringStatus as AssetRingStatus) || 'safe';
        const shieldFlash = Boolean(cfg.shieldFlash);
        const interceptBadgeText = (cfg.interceptBadgeText as string) || '';
        const compromisedBadgeText = (cfg.compromisedBadgeText as string) || '';
        const label = String(cfg.nodeTitle || cfg.label || '');
        const subLabel = String(cfg.subLabel || '');

        const isTier3 = boundaryLayer === 'tier3-asset';
        const keyWidth = isTier3 ? 116 : 148;
        const keyHeight = isTier3 ? 76 : 86;

        // 透明主交互包围盒
        const keyShape = group.addShape('rect', {
          attrs: {
            x: -keyWidth / 2,
            y: -keyHeight / 2,
            width: keyWidth,
            height: keyHeight,
            fill: 'rgba(6, 11, 25, 0.01)',
            stroke: 'transparent',
            radius: 6,
            cursor: 'grab',
          },
          name: 'node-key-box',
          draggable: true,
        });

        // ================= 1) 底座发光状态光环 =================
        let ringColor = '#00e5ff';
        let ringGlow = 'rgba(0, 229, 255, 0.55)';
        if (isTier3) {
          if (ringStatus === 'compromised') {
            ringColor = '#ff1e56';
            ringGlow = 'rgba(255, 30, 86, 0.95)';
          } else if (ringStatus === 'probing') {
            ringColor = '#f59e0b';
            ringGlow = 'rgba(245, 158, 11, 0.8)';
          } else {
            ringColor = '#10b981';
            ringGlow = 'rgba(16, 185, 129, 0.75)';
          }
        } else if (deviceKind === 'router') {
          ringColor = '#38bdf8';
          ringGlow = 'rgba(56, 189, 248, 0.7)';
        } else if (deviceKind === 'ngfw' || deviceKind === 'waf') {
          ringColor = shieldFlash ? '#ff2a55' : '#00e5ff';
          ringGlow = shieldFlash ? 'rgba(255, 42, 85, 0.95)' : 'rgba(0, 229, 255, 0.7)';
        } else {
          ringColor = '#a855f7';
          ringGlow = 'rgba(168, 85, 247, 0.7)';
        }

        const baseCy = isTier3 ? 4 : 6;
        const baseRx = isTier3 ? 28 : 34;
        const baseRy = isTier3 ? 12 : 14;

        // 外层发光状态环 (椭圆透视路径)
        const outerRing = group.addShape('path', {
          attrs: {
            path: [
              ['M', -baseRx, baseCy],
              ['A', baseRx, baseRy, 0, 1, 0, baseRx, baseCy],
              ['A', baseRx, baseRy, 0, 1, 0, -baseRx, baseCy],
              ['Z'],
            ],
            fill: 'rgba(8, 17, 36, 0.9)',
            stroke: ringColor,
            lineWidth: ringStatus === 'compromised' || shieldFlash ? 3 : 2,
            shadowColor: ringGlow,
            shadowBlur: ringStatus === 'compromised' || shieldFlash ? 22 : 12,
          },
          name: 'status-outer-ring',
          draggable: true,
        });

        // 内层 2.5D 台阶椭圆环
        group.addShape('path', {
          attrs: {
            path: [
              ['M', -(baseRx - 6), baseCy - 1],
              ['A', baseRx - 6, baseRy - 3, 0, 1, 0, baseRx - 6, baseCy - 1],
              ['A', baseRx - 6, baseRy - 3, 0, 1, 0, -(baseRx - 6), baseCy - 1],
              ['Z'],
            ],
            fill: '#0b1730',
            stroke: ringColor,
            lineWidth: 1,
            lineDash: [4, 3],
            opacity: 0.85,
          },
          name: 'status-inner-ring',
          draggable: true,
        });

        // 若处于失陷态 (compromised)，增加持续脉冲扩散红环动画
        if (ringStatus === 'compromised') {
          const shockRing = group.addShape('path', {
            attrs: {
              path: [
                ['M', -baseRx, baseCy],
                ['A', baseRx, baseRy, 0, 1, 0, baseRx, baseCy],
                ['A', baseRx, baseRy, 0, 1, 0, -baseRx, baseCy],
                ['Z'],
              ],
              stroke: '#ff1e56',
              lineWidth: 2.5,
              shadowColor: '#ff1e56',
              shadowBlur: 20,
              opacity: 0.95,
            },
            name: 'compromised-shock-ring',
            draggable: true,
          });
          shockRing.animate(
            (ratio: number) => {
              const rx = baseRx + ratio * 16;
              const ry = baseRy + ratio * 8;
              return {
                path: [
                  ['M', -rx, baseCy],
                  ['A', rx, ry, 0, 1, 0, rx, baseCy],
                  ['A', rx, ry, 0, 1, 0, -rx, baseCy],
                  ['Z'],
                ],
                opacity: 1 - ratio * 0.9,
              };
            },
            {
              repeat: true,
              duration: 900,
              easing: 'easeCubic',
            }
          );

          outerRing.animate(
            (ratio: number) => ({
              lineWidth: 2.5 + Math.sin(ratio * Math.PI * 2) * 1.2,
              shadowBlur: 18 + Math.sin(ratio * Math.PI * 2) * 10,
            }),
            {
              repeat: true,
              duration: 700,
            }
          );
        }

        // ================= 2) 2.5D 立体设备主体绘制 =================
        if (deviceKind === 'router') {
          const rx = 24;
          const ry = 10;
          const topY = -14;
          const botY = 2;
          group.addShape('path', {
            attrs: {
              path: [
                ['M', -rx, topY],
                ['L', -rx, botY],
                ['A', rx, ry, 0, 0, 0, rx, botY],
                ['L', rx, topY],
                ['Z'],
              ],
              fill: 'l(0) 0:#0a2647 0.5:#144272 1:#0a2647',
              stroke: '#38bdf8',
              lineWidth: 1.4,
            },
            name: 'router-body',
            draggable: true,
          });
          group.addShape('path', {
            attrs: {
              path: [
                ['M', -rx, topY],
                ['A', rx, ry, 0, 1, 0, rx, topY],
                ['A', rx, ry, 0, 1, 0, -rx, topY],
                ['Z'],
              ],
              fill: '#1e3a5f',
              stroke: '#7dd3fc',
              lineWidth: 1.5,
            },
            name: 'router-top',
            draggable: true,
          });
          group.addShape('path', {
            attrs: {
              path: [
                ['M', -12, topY],
                ['L', 12, topY],
                ['M', 0, topY - 5],
                ['L', 0, topY + 5],
              ],
              stroke: '#00e5ff',
              lineWidth: 2,
            },
            name: 'router-cross',
            draggable: true,
          });
        } else if (deviceKind === 'ngfw' || deviceKind === 'waf') {
          const wallColor = shieldFlash
            ? '#ff2a55'
            : deviceKind === 'ngfw'
            ? '#0ea5e9'
            : '#06b6d4';
          const wallFillLeft = shieldFlash ? '#4c0519' : '#0c2d48';
          const wallFillRight = shieldFlash ? '#881337' : '#145374';
          const wallFillTop = shieldFlash ? '#be123c' : '#227c9d';

          group.addShape('polygon', {
            attrs: {
              points: [
                [0, -28],
                [22, -18],
                [0, -8],
                [-22, -18],
              ],
              fill: wallFillTop,
              stroke: wallColor,
              lineWidth: 1.2,
            },
            name: 'gw-top',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [-22, -18],
                [0, -8],
                [0, 6],
                [-22, -4],
              ],
              fill: wallFillLeft,
              stroke: wallColor,
              lineWidth: 1.2,
            },
            name: 'gw-left',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [22, -18],
                [0, -8],
                [0, 6],
                [22, -4],
              ],
              fill: wallFillRight,
              stroke: wallColor,
              lineWidth: 1.2,
            },
            name: 'gw-right',
            draggable: true,
          });

          const shieldStroke = shieldFlash ? '#ff4d6d' : '#67e8f9';
          const shieldFill = shieldFlash
            ? 'rgba(255, 30, 86, 0.88)'
            : 'rgba(6, 36, 60, 0.92)';
          const shieldShape = group.addShape('path', {
            attrs: {
              path: [
                ['M', 0, -24],
                ['L', 12, -19],
                ['L', 10, -5],
                ['L', 0, 3],
                ['L', -10, -5],
                ['L', -12, -19],
                ['Z'],
              ],
              fill: shieldFill,
              stroke: shieldStroke,
              lineWidth: shieldFlash ? 2.4 : 1.6,
              shadowColor: shieldStroke,
              shadowBlur: shieldFlash ? 22 : 10,
            },
            name: 'gw-shield',
            draggable: true,
          });

          if (shieldFlash) {
            shieldShape.animate(
              (ratio: number) => ({
                shadowBlur: 14 + Math.sin(ratio * Math.PI * 2) * 14,
                lineWidth: 2 + Math.sin(ratio * Math.PI * 2) * 1.2,
              }),
              {
                repeat: true,
                duration: 600,
              }
            );
          }
        } else if (deviceKind === 'gatekeeper' || deviceKind === 'ids') {
          const isoStroke = deviceKind === 'gatekeeper' ? '#c084fc' : '#38bdf8';
          group.addShape('polygon', {
            attrs: {
              points: [
                [-10, -24],
                [-2, -20],
                [-2, 2],
                [-10, 6],
                [-18, 2],
                [-18, -20],
              ],
              fill: '#1e1b4b',
              stroke: isoStroke,
              lineWidth: 1.3,
            },
            name: 'iso-tower-left',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [10, -24],
                [18, -20],
                [18, 2],
                [10, 6],
                [2, 2],
                [2, -20],
              ],
              fill: '#172554',
              stroke: isoStroke,
              lineWidth: 1.3,
            },
            name: 'iso-tower-right',
            draggable: true,
          });
          group.addShape('rect', {
            attrs: {
              x: -6,
              y: -14,
              width: 12,
              height: 6,
              fill: '#e879f9',
              shadowColor: '#e879f9',
              shadowBlur: 10,
              radius: 2,
            },
            name: 'iso-bridge',
            draggable: true,
          });
        } else if (deviceKind === 'database') {
          const dbStroke =
            ringStatus === 'compromised'
              ? '#ff1e56'
              : ringStatus === 'probing'
              ? '#f59e0b'
              : '#10b981';
          const dbFill =
            ringStatus === 'compromised'
              ? '#4c0519'
              : ringStatus === 'probing'
              ? '#3b2106'
              : '#063429';
          const tiers = [-18, -10, -2];
          tiers.forEach((ty, idx) => {
            group.addShape('path', {
              attrs: {
                path: [
                  ['M', -15, ty],
                  ['L', -15, ty + 6],
                  ['A', 15, 5, 0, 0, 0, 15, ty + 6],
                  ['L', 15, ty],
                  ['Z'],
                ],
                fill: dbFill,
                stroke: dbStroke,
                lineWidth: 1.2,
              },
              name: `db-tier-body-${idx}`,
              draggable: true,
            });
            group.addShape('path', {
              attrs: {
                path: [
                  ['M', -15, ty],
                  ['A', 15, 5, 0, 1, 0, 15, ty],
                  ['A', 15, 5, 0, 1, 0, -15, ty],
                  ['Z'],
                ],
                fill: ringStatus === 'compromised' ? '#881337' : '#0f2942',
                stroke: dbStroke,
                lineWidth: 1.2,
              },
              name: `db-tier-top-${idx}`,
              draggable: true,
            });
          });
        } else if (deviceKind === 'plc') {
          // 2.5D 工业 PLC / 远动 RTU / 硬件加密控制模组 (DIN导轨双槽立体工控机箱 + 信号脉冲灯)
          const plcStroke =
            ringStatus === 'compromised'
              ? '#ff1e56'
              : ringStatus === 'probing'
              ? '#f59e0b'
              : '#38bdf8';
          const plcFill =
            ringStatus === 'compromised'
              ? '#500724'
              : ringStatus === 'probing'
              ? '#451a03'
              : '#0c2d48';
          // 立体底座斜顶
          group.addShape('polygon', {
            attrs: {
              points: [
                [-16, -22],
                [10, -26],
                [18, -19],
                [-8, -15],
              ],
              fill: ringStatus === 'compromised' ? '#9f1239' : '#164e63',
              stroke: plcStroke,
              lineWidth: 1.3,
            },
            name: 'plc-top',
            draggable: true,
          });
          // 正面导轨控制面板
          group.addShape('polygon', {
            attrs: {
              points: [
                [-16, -22],
                [-8, -15],
                [-8, 5],
                [-16, -2],
              ],
              fill: '#081c30',
              stroke: plcStroke,
              lineWidth: 1.2,
            },
            name: 'plc-side',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [-8, -15],
                [18, -19],
                [18, 1],
                [-8, 5],
              ],
              fill: plcFill,
              stroke: plcStroke,
              lineWidth: 1.3,
            },
            name: 'plc-front',
            draggable: true,
          });
          // 工业 I/O 端子排与状态灯
          [-3, 4, 11].forEach((lx, i) => {
            group.addShape('circle', {
              attrs: {
                x: lx,
                y: -9 - i * 1,
                r: 2.1,
                fill:
                  ringStatus === 'compromised'
                    ? '#ff1e56'
                    : i === 0
                    ? '#10b981'
                    : '#38bdf8',
              },
              name: `plc-led-${i}`,
              draggable: true,
            });
          });
        } else if (deviceKind === 'terminal') {
          const termStroke =
            ringStatus === 'compromised'
              ? '#ff1e56'
              : ringStatus === 'probing'
              ? '#f59e0b'
              : '#2dd4bf';
          group.addShape('polygon', {
            attrs: {
              points: [
                [-14, -22],
                [12, -26],
                [12, -8],
                [-14, -4],
              ],
              fill: '#0c243c',
              stroke: termStroke,
              lineWidth: 1.4,
            },
            name: 'term-screen',
            draggable: true,
          });
          group.addShape('path', {
            attrs: {
              path: [
                ['M', -9, -17],
                ['L', 6, -19],
                ['M', -9, -12],
                ['L', 2, -13.5],
              ],
              stroke: termStroke,
              lineWidth: 1.5,
            },
            name: 'term-code',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [-10, 0],
                [14, -3],
                [18, 2],
                [-6, 5],
              ],
              fill: '#1e293b',
              stroke: termStroke,
              lineWidth: 1,
            },
            name: 'term-keyboard',
            draggable: true,
          });
        } else {
          // 2.5D 等轴测刀片服务器机柜 (server)
          const srvStroke =
            ringStatus === 'compromised'
              ? '#ff1e56'
              : ringStatus === 'probing'
              ? '#f59e0b'
              : '#10b981';
          group.addShape('polygon', {
            attrs: {
              points: [
                [0, -28],
                [15, -21],
                [0, -14],
                [-15, -21],
              ],
              fill: ringStatus === 'compromised' ? '#881337' : '#1e3a5f',
              stroke: srvStroke,
              lineWidth: 1.2,
            },
            name: 'srv-top',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [-15, -21],
                [0, -14],
                [0, 5],
                [-15, -2],
              ],
              fill: ringStatus === 'compromised' ? '#4c0519' : '#0b1e36',
              stroke: srvStroke,
              lineWidth: 1.2,
            },
            name: 'srv-left',
            draggable: true,
          });
          group.addShape('polygon', {
            attrs: {
              points: [
                [15, -21],
                [0, -14],
                [0, 5],
                [15, -2],
              ],
              fill: ringStatus === 'compromised' ? '#6b0f2b' : '#132f50',
              stroke: srvStroke,
              lineWidth: 1.2,
            },
            name: 'srv-right',
            draggable: true,
          });
          [-12, -7, -2].forEach((ly, i) => {
            group.addShape('path', {
              attrs: {
                path: [
                  ['M', -11, ly - 3],
                  ['L', -3, ly],
                ],
                stroke: srvStroke,
                lineWidth: 1.6,
              },
              name: `srv-led-${i}`,
              draggable: true,
            });
          });
        }

        // ================= 3) 节点底部清晰中文标签与 IP 铭牌 =================
        const labelPlateY = isTier3 ? 19 : 22;
        const labelPlateWidth = isTier3 ? 116 : 146;
        const labelPlateHeight = subLabel ? 28 : 18;

        group.addShape('rect', {
          attrs: {
            x: -labelPlateWidth / 2,
            y: labelPlateY,
            width: labelPlateWidth,
            height: labelPlateHeight,
            radius: 4,
            fill: 'rgba(6, 11, 25, 0.90)',
            stroke:
              ringStatus === 'compromised'
                ? '#ff1e56'
                : shieldFlash
                ? '#ff2a55'
                : 'rgba(34, 64, 105, 0.85)',
            lineWidth: ringStatus === 'compromised' || shieldFlash ? 1.5 : 1,
          },
          name: 'label-bg',
          draggable: true,
        });

        group.addShape('text', {
          attrs: {
            x: 0,
            y: labelPlateY + 9,
            text: label,
            fontSize: isTier3 ? 10 : 11,
            fontWeight: 700,
            fill: ringStatus === 'compromised' ? '#ffe4e6' : '#f1f5f9',
            textAlign: 'center',
            textBaseline: 'middle',
            fontFamily: '"Noto Sans SC", "Source Han Sans SC", sans-serif',
          },
          name: 'node-main-label',
          draggable: true,
        });

        if (subLabel) {
          group.addShape('text', {
            attrs: {
              x: 0,
              y: labelPlateY + 21,
              text: subLabel,
              fontSize: 8.8,
              fill: ringStatus === 'compromised' ? '#fda4af' : '#7dd3fc',
              textAlign: 'center',
              textBaseline: 'middle',
              fontFamily: '"JetBrains Mono", monospace',
            },
            name: 'node-sub-label',
            draggable: true,
          });
        }

        // ================= 4) 阶段 1：受攻击边界网关上方浮现拦截提示 =================
        if (interceptBadgeText) {
          const badgeW = 136;
          const badgeH = 22;
          const badgeY = -54;
          group.addShape('rect', {
            attrs: {
              x: -badgeW / 2,
              y: badgeY,
              width: badgeW,
              height: badgeH,
              radius: 4,
              fill: 'rgba(136, 19, 55, 0.95)',
              stroke: '#ff3b5c',
              lineWidth: 1.5,
              shadowColor: '#ff3b5c',
              shadowBlur: 14,
            },
            name: 'intercept-badge-rect',
          });
          group.addShape('text', {
            attrs: {
              x: 0,
              y: badgeY + badgeH / 2,
              text: `🛡️ ${interceptBadgeText}`,
              fontSize: 10,
              fontWeight: 700,
              fill: '#ffe4e6',
              textAlign: 'center',
              textBaseline: 'middle',
              fontFamily: '"Noto Sans SC", sans-serif',
            },
            name: 'intercept-badge-text',
          });
        }

        // ================= 5) 阶段 3：核心靶标右上角亮起红色警示角标「! 已失陷」 =================
        if (compromisedBadgeText) {
          const cBadgeW = 68;
          const cBadgeH = 20;
          const cBadgeX = 16;
          const cBadgeY = -42;
          const badgeBox = group.addShape('rect', {
            attrs: {
              x: cBadgeX,
              y: cBadgeY,
              width: cBadgeW,
              height: cBadgeH,
              radius: 4,
              fill: '#e11d48',
              stroke: '#fecdd3',
              lineWidth: 1.5,
              shadowColor: '#ff1e56',
              shadowBlur: 18,
            },
            name: 'compromised-badge-rect',
          });
          group.addShape('text', {
            attrs: {
              x: cBadgeX + cBadgeW / 2,
              y: cBadgeY + cBadgeH / 2,
              text: compromisedBadgeText,
              fontSize: 10.5,
              fontWeight: 800,
              fill: '#ffffff',
              textAlign: 'center',
              textBaseline: 'middle',
              fontFamily: '"Noto Sans SC", sans-serif',
            },
            name: 'compromised-badge-text',
          });
          badgeBox.animate(
            (ratio: number) => ({
              opacity: 0.78 + Math.sin(ratio * Math.PI * 2) * 0.22,
              shadowBlur: 12 + Math.sin(ratio * Math.PI * 2) * 10,
            }),
            {
              repeat: true,
              duration: 650,
            }
          );
        }

        return keyShape;
      },
      update(cfg: ModelConfig, item: any) {
        const group = item.getContainer();
        group.clear();
        const keyShape = (this as any).draw(cfg, group);
        item.set('keyShape', keyShape);
      },
      getAnchorPoints() {
        return [
          [0.5, 0],
          [0.5, 1],
        ];
      },
    },
    'single-node'
  );

  /**
   * 2. 注册多变体逃逸脉冲流光动画边：sandbox-pulse-edge
   */
  G6.registerEdge(
    'sandbox-pulse-edge',
    {
      afterDraw(cfg: ModelConfig | undefined, group: IGroup | undefined) {
        if (!cfg || !group) return;
        const keyShape = group.get('children')[0] as IShape & {
          getPoint: (ratio: number) => { x: number; y: number };
        };
        if (!keyShape) return;

        const pulseState = (cfg.pulseState as string) || 'none';
        if (pulseState === 'none') return;

        let laserColor = '#ff3b5c';
        let glowColor = '#ff3b5c';
        let duration = 1200;

        if (pulseState === 'stage1-red') {
          laserColor = '#ff3b5c';
          glowColor = '#ff1e42';
          duration = 1050;
        } else if (pulseState === 'stage2-purple-blocked') {
          laserColor = '#c084fc';
          glowColor = '#a855f7';
          duration = 1350;
        } else if (pulseState === 'stage2-purple-bypass') {
          laserColor = '#d946ef';
          glowColor = '#e879f9';
          duration = 1000;
        } else if (pulseState === 'stage3-crimson-strike') {
          laserColor = '#ff1e74';
          glowColor = '#ff0055';
          duration = 880;
        }

        const pathData = keyShape.attr('path');

        const neonBeam = group.addShape('path', {
          attrs: {
            path: pathData,
            stroke: laserColor,
            lineWidth: pulseState === 'stage3-crimson-strike' ? 3.6 : 2.8,
            lineDash: [18, 14],
            lineDashOffset: 0,
            shadowColor: glowColor,
            shadowBlur: 16,
            lineCap: 'round',
          },
          name: 'neon-pulse-beam',
        });

        neonBeam.animate(
          (ratio: number) => ({
            lineDashOffset: -ratio * 64,
          }),
          {
            repeat: true,
            duration: duration * 0.75,
          }
        );

        [0, 0.45].forEach((offset, idx) => {
          const initPt = keyShape.getPoint(offset) || { x: 0, y: 0 };
          const orb = group.addShape('circle', {
            attrs: {
              x: initPt.x,
              y: initPt.y,
              r: pulseState === 'stage3-crimson-strike' ? 4.8 : 3.8,
              fill: '#ffffff',
              stroke: laserColor,
              lineWidth: 2.2,
              shadowColor: glowColor,
              shadowBlur: 16,
            },
            name: `pulse-laser-orb-${idx}`,
          });

          orb.animate(
            (ratio: number) => {
              const t = (ratio + offset) % 1;
              const clampedT =
                pulseState === 'stage2-purple-blocked' ? Math.min(t, 0.88) : t;
              const pt = keyShape.getPoint(clampedT) || { x: 0, y: 0 };
              const fadeOut =
                pulseState === 'stage2-purple-blocked' && t > 0.82 ? 0.15 : 1;
              return {
                x: pt.x,
                y: pt.y,
                opacity: fadeOut,
              };
            },
            {
              repeat: true,
              duration,
            }
          );
        });

        if (pulseState === 'stage2-purple-blocked') {
          const endPt = keyShape.getPoint(0.88);
          if (endPt) {
            group.addShape('circle', {
              attrs: {
                x: endPt.x,
                y: endPt.y,
                r: 9,
                fill: 'rgba(124, 45, 18, 0.95)',
                stroke: '#fb923c',
                lineWidth: 1.5,
                shadowColor: '#fb923c',
                shadowBlur: 10,
              },
              name: 'blocked-stop-circle',
            });
            group.addShape('text', {
              attrs: {
                x: endPt.x,
                y: endPt.y + 0.5,
                text: '✕',
                fontSize: 10,
                fontWeight: 800,
                fill: '#fed7aa',
                textAlign: 'center',
                textBaseline: 'middle',
              },
              name: 'blocked-stop-x',
            });
          }
        }
      },
      update: undefined,
    },
    'cubic-vertical'
  );
}

/**
 * 将指定关基单位的 UnitSandboxTopologyBundle 转换为 G6 渲染数据结构
 */
function buildUnitG6GraphData(bundle: UnitSandboxTopologyBundle) {
  const nodes = bundle.nodes.map((n) => ({
    ...n,
    nodeTitle: n.label,
    label: '',
    type: 'sandbox-25d-node',
    x: n.customX ?? 710,
    y: n.customY ?? 200,
    shieldFlash: false,
    interceptBadgeText: '',
    compromisedBadgeText: '',
  }));

  const edges = bundle.edges.map((e) => ({
    ...e,
    type: 'sandbox-pulse-edge',
    sourceAnchor: 1,
    targetAnchor: 0,
    style: {
      stroke: e.edgeCategory === 'backbone' ? '#2563eb' : '#1e3a5f',
      lineWidth: e.edgeCategory === 'backbone' ? 2 : 1.5,
      opacity: 0.85,
      endArrow: {
        path: G6.Arrow.triangle(6, 8, 2),
        fill: '#38bdf8',
        d: 2,
      },
    },
  }));

  const combos = bundle.combos.map((c) => ({
    id: c.id,
    label: `${c.label} · ${c.zoneCode.split('·')[0].trim()}`,
    type: 'rect',
    padding: [34, 18, 22, 18],
    style: {
      fill: c.fillColor,
      stroke: c.borderColor,
      lineWidth: 1.8,
      lineDash: [8, 5],
      radius: 8,
      shadowColor: c.glowColor,
      shadowBlur: 18,
    },
    labelCfg: {
      position: 'top',
      refY: 10,
      style: {
        fill: c.borderColor,
        fontSize: 11.5,
        fontWeight: 700,
        fontFamily: '"Noto Sans SC", "JetBrains Mono", sans-serif',
      },
    },
  }));

  return { nodes, edges, combos };
}

export const LayeredTopologyView: React.FC<LayeredTopologyViewProps> = ({
  selectedCiioUnitId = '10',
  onSelectCiioUnit,
  onBackToMap,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const stageTimersRef = useRef<number[]>([]);

  const [activeUnitId, setActiveUnitId] = useState<string>(selectedCiioUnitId || '10');

  useEffect(() => {
    if (selectedCiioUnitId && CIIO_G6_SANDBOX_TOPOLOGIES[selectedCiioUnitId]) {
      setActiveUnitId(selectedCiioUnitId);
    }
  }, [selectedCiioUnitId]);

  const activeBundle = useMemo(
    () => getG6SandboxTopologyByUnit(activeUnitId),
    [activeUnitId]
  );

  const allUnitBundles = useMemo(
    () => Object.values(CIIO_G6_SANDBOX_TOPOLOGIES),
    []
  );

  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [stageBannerText, setStageBannerText] = useState<string>(
    activeBundle.escapeConfig.timeline[1].bannerText
  );
  const [stageAccentColor, setStageAccentColor] = useState<string>(
    activeBundle.escapeConfig.timeline[1].accentColor
  );

  const clearStageTimers = useCallback(() => {
    stageTimersRef.current.forEach((id) => window.clearTimeout(id));
    stageTimersRef.current = [];
  }, []);

  /**
   * 将当前关基单位画布内所有节点与边重置为初始安全基线态
   */
  const resetGraphToBaseline = useCallback(
    (graph: Graph, bundle: UnitSandboxTopologyBundle) => {
      bundle.nodes.forEach((rawNode) => {
        const item = graph.findById(rawNode.id);
        if (item) {
          graph.updateItem(item, {
            ringStatus: rawNode.ringStatus || 'safe',
            shieldFlash: false,
            interceptBadgeText: '',
            compromisedBadgeText: '',
          });
        }
      });

      bundle.edges.forEach((rawEdge) => {
        const edgeItem = graph.findById(rawEdge.id);
        if (edgeItem) {
          graph.updateItem(edgeItem, {
            pulseState: 'none',
            style: {
              stroke: rawEdge.edgeCategory === 'backbone' ? '#2563eb' : '#1e3a5f',
              lineWidth: rawEdge.edgeCategory === 'backbone' ? 2 : 1.5,
              opacity: 0.85,
            },
          });
        }
      });
    },
    []
  );

  /**
   * 启动并循环执行当前关基单位专属的三阶段多变体逃逸脉冲流光演示
   */
  const runMultiVariantEscapeCycle = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || graph.get('destroyed')) return;

    const bundle = activeBundle;
    const esc = bundle.escapeConfig;

    clearStageTimers();
    resetGraphToBaseline(graph, bundle);

    // ================= 阶段 1：原始载荷受阻 (0ms ~ 3400ms) =================
    setCurrentStage(1);
    setStageBannerText(esc.timeline[1].bannerText);
    setStageAccentColor(esc.timeline[1].accentColor);

    const stage1Edge = graph.findById(esc.stage1EdgeId);
    if (stage1Edge) {
      graph.updateItem(stage1Edge, {
        pulseState: 'stage1-red',
        style: {
          stroke: '#ff3b5c',
          lineWidth: 2.8,
          opacity: 1,
        },
      });
    }

    // 850ms 后脉冲抵达边界网关：触发红色护盾闪烁 + 顶部浮现该关基专属拦截提示
    const t1Shield = window.setTimeout(() => {
      if (!graphRef.current || graphRef.current.get('destroyed')) return;
      const interceptNode = graphRef.current.findById(esc.stage1InterceptNodeId);
      if (interceptNode) {
        graphRef.current.updateItem(interceptNode, {
          shieldFlash: true,
          interceptBadgeText: esc.stage1InterceptText,
        });
      }
    }, 850);

    // ================= 阶段 2：智能体裂变多变体 (3400ms ~ 6800ms) =================
    const t2Stage = window.setTimeout(() => {
      const g = graphRef.current;
      if (!g || g.get('destroyed')) return;

      setCurrentStage(2);
      setStageBannerText(esc.timeline[2].bannerText);
      setStageAccentColor(esc.timeline[2].accentColor);

      const interceptNode = g.findById(esc.stage1InterceptNodeId);
      if (interceptNode) {
        g.updateItem(interceptNode, {
          shieldFlash: false,
          interceptBadgeText: '',
        });
      }

      esc.timeline[2].activeEdges.forEach(({ edgeId, pulseState }) => {
        const edgeItem = g.findById(edgeId);
        if (edgeItem) {
          g.updateItem(edgeItem, {
            pulseState,
            style: {
              stroke: pulseState === 'stage2-purple-bypass' ? '#d946ef' : '#a855f7',
              lineWidth: 2.6,
              opacity: 1,
            },
          });
        }
      });
    }, 3400);

    // 5400ms 时：2 条受阻紫色变体熄灭，仅保留穿透隔离装置的第 3 条变体
    const t2Extinguish = window.setTimeout(() => {
      const g = graphRef.current;
      if (!g || g.get('destroyed')) return;

      esc.stage2BlockedEdgeIds.forEach((blockedEdgeId) => {
        const blockedEdge = g.findById(blockedEdgeId);
        if (blockedEdge) {
          g.updateItem(blockedEdge, {
            pulseState: 'none',
            style: {
              stroke: '#1e3a5f',
              lineWidth: 1.5,
              opacity: 0.45,
            },
          });
        }
      });
    }, 5400);

    // ================= 阶段 3：跨区穿透打穿核心靶标 (6800ms ~ 11500ms) =================
    const t3Stage = window.setTimeout(() => {
      const g = graphRef.current;
      if (!g || g.get('destroyed')) return;

      setCurrentStage(3);
      setStageBannerText(esc.timeline[3].bannerText);
      setStageAccentColor(esc.timeline[3].accentColor);

      esc.stage3StrikeEdgeIds.forEach((strikeEdgeId) => {
        const strikeEdge = g.findById(strikeEdgeId);
        if (strikeEdge) {
          g.updateItem(strikeEdge, {
            pulseState: 'stage3-crimson-strike',
            style: {
              stroke: '#ff1e74',
              lineWidth: 3.4,
              opacity: 1,
            },
          });
        }
      });
    }, 6800);

    // 7600ms 时：紫红色流光击中该关基单位的核心靶标，绿色状态环变为高亮闪烁红环 + 右上角亮起「! 已失陷」
    const t3Impact = window.setTimeout(() => {
      const g = graphRef.current;
      if (!g || g.get('destroyed')) return;

      const coreTargetNode = g.findById(esc.stage3CompromisedNodeId);
      if (coreTargetNode) {
        g.updateItem(coreTargetNode, {
          ringStatus: 'compromised',
          compromisedBadgeText: '! 已失陷',
        });
      }
    }, 7600);

    // 12200ms 后自动循环重播演示
    const tLoop = window.setTimeout(() => {
      runMultiVariantEscapeCycle();
    }, 12200);

    stageTimersRef.current.push(
      t1Shield,
      t2Stage,
      t2Extinguish,
      t3Stage,
      t3Impact,
      tLoop
    );
  }, [activeBundle, clearStageTimers, resetGraphToBaseline]);

  // 适应画布视角
  const handleFitView = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || graph.get('destroyed')) return;
    graph.fitView([58, 36, 28, 36]);
  }, []);

  // 切换关基单位
  const handleUnitChange = (nextUnitId: string) => {
    setActiveUnitId(nextUnitId);
    if (onSelectCiioUnit) {
      onSelectCiioUnit(nextUnitId);
    }
  };

  // 初始化或切换关基单位时重建 G6 拓扑沙盘实例
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    registerG6SandboxElements();

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 680;

    const unitGraphData = buildUnitG6GraphData(activeBundle);

    const graph = new G6.Graph({
      container,
      width,
      height,
      fitView: true,
      fitViewPadding: [58, 36, 28, 36],
      groupByTypes: false,
      modes: {
        default: [
          'drag-canvas',
          'zoom-canvas',
          'drag-node',
          'drag-combo',
        ],
      },
      defaultNode: {
        type: 'sandbox-25d-node',
      },
      defaultEdge: {
        type: 'sandbox-pulse-edge',
      },
      defaultCombo: {
        type: 'rect',
      },
    });

    graph.data(unitGraphData);
    graph.render();
    graph.updateCombos();
    graph.fitView([58, 36, 28, 36]);

    graphRef.current = graph;

    // 启动当前关基单位专属三阶段多变体逃逸演示
    const startId = window.setTimeout(() => {
      runMultiVariantEscapeCycle();
    }, 300);

    // 监听容器 resize 自适应宽高
    const handleResize = () => {
      if (!containerRef.current || !graphRef.current || graphRef.current.get('destroyed')) {
        return;
      }
      const nextW = containerRef.current.clientWidth;
      const nextH = containerRef.current.clientHeight;
      if (nextW > 0 && nextH > 0) {
        graphRef.current.changeSize(nextW, nextH);
        graphRef.current.fitView([58, 36, 28, 36]);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      window.clearTimeout(startId);
      clearStageTimers();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (graphRef.current && !graphRef.current.get('destroyed')) {
        graphRef.current.destroy();
      }
      graphRef.current = null;
    };
  }, [activeBundle, clearStageTimers, runMultiVariantEscapeCycle]);

  return (
    <div
      data-testid="g6-topology-sandbox"
      data-ciio-unit={activeBundle.unitId}
      data-escape-stage={currentStage}
      className="relative w-full h-full flex-1 overflow-hidden select-none"
      style={{
        backgroundColor: '#060b19',
        backgroundImage: `
          radial-gradient(circle at 50% 18%, rgba(14, 165, 233, 0.12), transparent 60%),
          linear-gradient(rgba(0, 229, 255, 0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 229, 255, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 28px 28px, 28px 28px',
      }}
    >
      {/* 顶部悬浮栏：单行 Flex 布局保证左侧控制按钮与右侧状态胶囊零重叠 */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
        {/* 1. 左上角：悬浮控制区（支持一键切换大盘10家关基单位专属拓扑 + 重播多变体逃逸演示 + 适应画布视角） */}
        <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#0d182e]/80 backdrop-blur-md border border-cyan-500/45 shadow-lg">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              aria-label="选择关基单位专属拓扑"
              value={activeBundle.unitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="bg-transparent text-cyan-100 text-xs font-semibold font-sans focus:outline-none cursor-pointer pr-1"
            >
              {allUnitBundles.map((u) => (
                <option
                  key={u.unitId}
                  value={u.unitId}
                  className="bg-[#091326] text-slate-100"
                >
                  [{u.unitId}] {u.shortName} · {u.region}
                </option>
              ))}
            </select>
          </div>

          {onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#0d182e]/75 hover:bg-[#152c52]/90 backdrop-blur-md border border-cyan-500/45 hover:border-cyan-300 text-cyan-200 text-xs font-semibold shadow-lg transition-all cursor-pointer"
              title="返回全国关基卫星监控大盘"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>大盘地图</span>
            </button>
          )}

          <button
            type="button"
            onClick={runMultiVariantEscapeCycle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0d182e]/75 hover:bg-[#152c52]/90 backdrop-blur-md border border-cyan-500/45 hover:border-cyan-300 text-cyan-100 text-xs font-semibold shadow-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
            <span>重播多变体逃逸演示</span>
          </button>

          <button
            type="button"
            onClick={handleFitView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0d182e]/75 hover:bg-[#152c52]/90 backdrop-blur-md border border-cyan-500/45 hover:border-cyan-300 text-slate-100 text-xs font-semibold shadow-lg transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>适应画布视角</span>
          </button>
        </div>

        {/* 2. 顶部右侧：极简状态胶囊，显示当前关基单位标识与三阶段推演提示 */}
        <div className="min-w-0 flex-1 flex justify-end pointer-events-none">
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#091326]/85 backdrop-blur-md border text-xs shadow-xl transition-all duration-300 max-w-full overflow-hidden"
            style={{
              borderColor: stageAccentColor,
              boxShadow: `0 0 18px ${stageAccentColor}33`,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
              style={{
                backgroundColor: stageAccentColor,
                boxShadow: `0 0 10px ${stageAccentColor}`,
              }}
            />
            <span className="font-mono font-bold text-cyan-300 whitespace-nowrap">
              #{activeBundle.unitId} {activeBundle.shortName}
            </span>
            <span className="text-slate-500 shrink-0">·</span>
            <span className="font-mono font-bold text-slate-100 whitespace-nowrap">
              {activeBundle.escapeConfig.timeline[currentStage].title}
            </span>
            <span className="text-slate-500 shrink-0">|</span>
            <span className="text-slate-200 truncate">{stageBannerText}</span>
          </div>
        </div>
      </div>

      {/* 3. AntV G6 100% 撑满拓扑沙盘画布容器 */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
