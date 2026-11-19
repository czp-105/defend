import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Scene, PointLayer, LineLayer, PolygonLayer, RasterLayer, type ILayer } from '@antv/l7';
import { Map as L7Map } from '@antv/l7-maps';
import {
  CampaignQueueItem,
  DefenseSystem,
  GateCheckStatus,
  TacticPhase,
  VerdictStat,
} from '../../types/cidtp';
import {
  INITIAL_CIIO_UNITS,
  STATUS_META,
  CiioBeaconStatus,
  CiioIndustry,
  CiioUnitItem,
} from '../../data/ciioUnitsTopologyData';
import {
  Shield,
  Radio,
  MapPin,
  Crosshair,
  Building2,
  Server,
  Compass,
  ExternalLink,
  Network,
  Layers,
} from 'lucide-react';

const MPS_COMMAND_CENTER: [number, number] = [116.3974, 39.9088]; // 公安部网安保卫局监管总中心（北京）

interface OverviewViewProps {
  queue: CampaignQueueItem[];
  selectedCampaign: string;
  onSelectCampaign: (code: string) => void;
  verdictStats: VerdictStat[];
  gateCheck: GateCheckStatus;
  defenseSystems: DefenseSystem[];
  tacticPhases: { key: TacticPhase; name: string; count: number; completed: number; isIcs?: boolean }[];
  onOpenArbitration: () => void;
  selectedCiioUnitId?: string;
  onOpenCiioTopology?: (unitId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectCampaign,
  onOpenArbitration,
  selectedCiioUnitId = '10',
  onOpenCiioTopology,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const pointLayerRef = useRef<ILayer | null>(null);
  const flyLineLayerRef = useRef<ILayer | null>(null);

  const [units] = useState<CiioUnitItem[]>(INITIAL_CIIO_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(selectedCiioUnitId || '10');
  const [industryFilter, setIndustryFilter] = useState<CiioIndustry | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<CiioBeaconStatus | 'ALL'>('ALL');
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [projectedCoords, setProjectedCoords] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    if (selectedCiioUnitId) {
      setSelectedUnitId(selectedCiioUnitId);
    }
  }, [selectedCiioUnitId]);

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (industryFilter !== 'ALL' && u.industry !== industryFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      return true;
    });
  }, [units, industryFilter, statusFilter]);

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) || units[0],
    [units, selectedUnitId]
  );

  // 统计各呼吸灯状态数量
  const statusCounts = useMemo(() => {
    return {
      green: units.filter((u) => u.status === 'green').length,
      yellow: units.filter((u) => u.status === 'yellow').length,
      red: units.filter((u) => u.status === 'red').length,
    };
  }, [units]);

  // 严格采用各关基真实高德 GCJ-02 经纬度 (unit.lngLat) 实时投射为容器像素坐标
  const syncProjectedPositions = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const next: Record<string, { x: number; y: number }> = {};
    INITIAL_CIIO_UNITS.forEach((u) => {
      try {
        const pt = scene.lngLatToContainer(u.lngLat);
        if (pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)) {
          next[u.id] = { x: pt.x, y: pt.y };
        }
      } catch {
        // ignore if map not ready
      }
    });
    setProjectedCoords(next);
  }, []);

  // 初始化 AntV L7 Scene + 直接采用高德卫星遥感影像 + 地名路网注记层 + 省级边界
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const scene = new Scene({
      id: mapContainerRef.current,
      logoVisible: false,
      map: new L7Map({
        center: [113.8, 32.5],
        zoom: 3.85,
        pitch: 20,
        minZoom: 3,
        maxZoom: 17,
      }),
    });

    sceneRef.current = scene;

    scene.on('loaded', async () => {
      // 1. 直接采用高德卫星遥感瓦片图层 (AMap Satellite Imagery style=6)
      const amapSatelliteLayer = new RasterLayer({
        zIndex: 1,
        visible: true,
      })
        .source(
          'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          {
            parser: {
              type: 'rasterTile',
              tileSize: 256,
              minZoom: 3,
              maxZoom: 17,
            },
          }
        )
        .style({
          opacity: 0.92,
        });

      // 2. 高德卫星地名与干道路网透明注记层 (AMap Hybrid Overlay style=8)
      const amapLabelOverlayLayer = new RasterLayer({
        zIndex: 2,
        visible: true,
      })
        .source(
          'https://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
          {
            parser: {
              type: 'rasterTile',
              tileSize: 256,
              minZoom: 3,
              maxZoom: 17,
            },
          }
        )
        .style({
          opacity: 0.78,
        });

      scene.addLayer(amapSatelliteLayer);
      scene.addLayer(amapLabelOverlayLayer);

      // 3. 叠加中国省级行政边界线增强卫星图辖区辨识度
      try {
        const res = await fetch('/assets/china_full.json');
        if (res.ok) {
          const chinaGeoJson = await res.json();

          const provinceFillLayer = new PolygonLayer({
            zIndex: 3,
          })
            .source(chinaGeoJson)
            .shape('fill')
            .color('#081c2c')
            .style({
              opacity: 0.14,
            });

          const provinceBorderLayer = new LineLayer({
            zIndex: 4,
          })
            .source(chinaGeoJson)
            .shape('line')
            .size(1)
            .color('#38bdf8')
            .style({
              opacity: 0.55,
            });

          scene.addLayer(provinceFillLayer);
          scene.addLayer(provinceBorderLayer);
        }
      } catch {
        // 离线回退：仅使用高德卫星图层
      }

      setMapReady(true);
    });

    return () => {
      try {
        scene.destroy();
      } catch {
        // ignore cleanup errors
      }
      sceneRef.current = null;
    };
  }, []);

  // 绑定相机移动、缩放与窗口尺寸变化时同步真实坐标投影
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !mapReady) return;

    syncProjectedPositions();
    const handleMove = () => syncProjectedPositions();
    scene.on('mapmove', handleMove);
    scene.on('zoomchange', handleMove);
    scene.on('resize', handleMove);

    return () => {
      scene.off('mapmove', handleMove);
      scene.off('zoomchange', handleMove);
      scene.off('resize', handleMove);
    };
  }, [mapReady, syncProjectedPositions]);

  // 动态同步 AntV L7 飞线层与底层 WebGL 波纹图层（全部锚定真实 GCJ-02 坐标 unit.lngLat）
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !mapReady) return;

    if (pointLayerRef.current) {
      scene.removeLayer(pointLayerRef.current);
      pointLayerRef.current = null;
    }
    if (flyLineLayerRef.current) {
      scene.removeLayer(flyLineLayerRef.current);
      flyLineLayerRef.current = null;
    }

    const pointFeatures = filteredUnits.map((u) => ({
      id: u.id,
      name: u.name,
      lng: u.lngLat[0],
      lat: u.lngLat[1],
      status: u.status,
      color: STATUS_META[u.status].hex,
      radius: u.status === 'red' ? 36 : u.status === 'yellow' ? 26 : 18,
    }));

    const flyLineFeatures = filteredUnits.map((u) => ({
      id: u.id,
      fromLng: MPS_COMMAND_CENTER[0],
      fromLat: MPS_COMMAND_CENTER[1],
      toLng: u.lngLat[0],
      toLat: u.lngLat[1],
      color: STATUS_META[u.status].hex,
    }));

    // 1. 公安部监管总中心 -> 10 个关基单位真实坐标督导遥测飞线图层 (AntV L7 LineLayer arc)
    const flyLineLayer = new LineLayer({ zIndex: 5 })
      .source(flyLineFeatures, {
        parser: {
          type: 'json',
          x: 'fromLng',
          y: 'fromLat',
          x1: 'toLng',
          y1: 'toLat',
        },
      })
      .shape('arc')
      .size(1.35)
      .color('color', (c: string) => c)
      .animate({
        enable: true,
        interval: 0.35,
        trailLength: 0.7,
        duration: 2.4,
      })
      .style({
        opacity: 0.72,
        thetaOffset: 0.25,
      });

    // 2. 10 个关基单位真实坐标底层 WebGL 扩散波纹图层 (AntV L7 PointLayer animate)
    const wavePointLayer = new PointLayer({ zIndex: 6 })
      .source(pointFeatures, {
        parser: {
          type: 'json',
          x: 'lng',
          y: 'lat',
        },
      })
      .shape('circle')
      .size('radius', (r: number) => r)
      .color('color', (c: string) => c)
      .animate({
        enable: true,
        speed: 1.25,
        rings: 3,
      })
      .style({
        opacity: 0.65,
      });

    scene.addLayer(flyLineLayer);
    scene.addLayer(wavePointLayer);
    flyLineLayerRef.current = flyLineLayer;
    pointLayerRef.current = wavePointLayer;
    syncProjectedPositions();
  }, [filteredUnits, mapReady, syncProjectedPositions]);

  // 视角快速巡航定位（全部使用高德真实卫星坐标）
  const handleFlyToRegion = (center: [number, number], zoom: number) => {
    if (sceneRef.current) {
      sceneRef.current.setZoomAndCenter(zoom, center);
      setTimeout(() => syncProjectedPositions(), 60);
    }
  };

  // 点击关基单位：更新选中态并直接跳转至该关基专属的 5 层防御结构拓扑靶场子页面
  const handleOpenUnitTopology = (unit: CiioUnitItem) => {
    setSelectedUnitId(unit.id);
    onSelectCampaign(unit.linkedCampaignCode);
    if (onOpenCiioTopology) {
      onOpenCiioTopology(unit.id);
    }
  };

  // 仅在卫星图上聚焦预览某关基真实坐标（不跳走）
  const handleFocusUnitOnMap = (unit: CiioUnitItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUnitId(unit.id);
    if (sceneRef.current) {
      sceneRef.current.setZoomAndCenter(11.5, unit.lngLat);
      setTimeout(() => syncProjectedPositions(), 60);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-142px)] min-h-[680px] text-xs font-sans select-none">
      {/* 1. 顶部：公安部网安关基监管指挥条 */}
      <div className="bg-[#111821] border border-[#223040] rounded-[4px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#0A0E13] border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">
                公安网安监管大盘 · 全国重点关基单位高德卫星精准定位态势图
              </h1>
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#0A0E13] border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                AntV L7 + 高德卫星影像 (GCJ-02 精准锚定)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              监管范围：5 大国家命脉行业 · 10 家重点关基单位（点击任一关基坐标或名录直接进入该单位专属 5 层防御结构资产拓扑靶场图）
            </p>
          </div>
        </div>

        {/* 右侧：三态呼吸灯实时统计过滤胶囊 */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-[4px] border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'ALL'
                ? 'bg-[#164e63] border-cyan-400 text-slate-100 font-bold'
                : 'bg-[#0A0E13] border-[#223040] text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>全部关基</span>
            <span className="text-cyan-300 tabular-nums">{units.length}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'green' ? 'ALL' : 'green')}
            className={`px-2.5 py-1 rounded-[4px] border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'green'
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-[#0A0E13] border-[#223040] text-emerald-400 hover:border-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>🟢 绿色常亮（防线稳固）</span>
            <span className="font-bold tabular-nums">{statusCounts.green}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'yellow' ? 'ALL' : 'yellow')}
            className={`px-2.5 py-1 rounded-[4px] border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'yellow'
                ? 'bg-amber-950 border-amber-400 text-amber-300 font-bold'
                : 'bg-[#0A0E13] border-[#223040] text-amber-400 hover:border-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 ciio-pulse-ring-yellow inline-block" />
            <span>🟡 黄色脉冲（边界失守）</span>
            <span className="font-bold tabular-nums">{statusCounts.yellow}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'red' ? 'ALL' : 'red')}
            className={`px-2.5 py-1 rounded-[4px] border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'red'
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                : 'bg-[#0A0E13] border-[#223040] text-rose-400 hover:border-rose-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 ciio-strobe-core-red inline-block" />
            <span>🔴 红色爆闪（重大隐患）</span>
            <span className="font-bold tabular-nums">{statusCounts.red}</span>
          </button>
        </div>
      </div>

      {/* 2. 主体：左栏（5大行业10家关基名录） + 中栏（高德卫星遥感实景大屏） + 右栏（关基5层防御结构摘要与跳转入口） */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* 左栏 (Cols 1-3)：五大行业 10 家关基保护单位监管名录 */}
        <div className="lg:col-span-3 bg-[#111821] border border-[#223040] rounded-[4px] flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-[#223040] space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                全国 10 大重点关基单位名录
              </span>
              <span className="font-mono text-[10px] text-cyan-300">
                点击直接进入 5 层防御拓扑
              </span>
            </div>

            {/* 五大行业筛选 */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {(
                [
                  'ALL',
                  '能源行业',
                  '金融行业',
                  '交通与物流',
                  '通信与广电',
                  '公共服务与医疗',
                ] as const
              ).map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustryFilter(ind)}
                  className={`px-1.5 py-0.5 rounded-[4px] border transition-colors ${
                    industryFilter === ind
                      ? 'bg-[#164e63] border-cyan-500 text-cyan-200 font-semibold'
                      : 'bg-[#0A0E13] border-[#223040] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ind === 'ALL' ? '全部行业' : ind}
                </button>
              ))}
            </div>
          </div>

          {/* 10 家关基单位滚动列表（点击直接进入该关基专属 5 层防御拓扑） */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredUnits.map((unit) => {
              const meta = STATUS_META[unit.status];
              const isSelected = unit.id === selectedUnitId;
              return (
                <div
                  key={unit.id}
                  onClick={() => handleOpenUnitTopology(unit)}
                  className={`p-2.5 rounded-[4px] border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[#16273b] border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'bg-[#0A0E13] border-[#223040] hover:border-cyan-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded-[2px] bg-[#111821] border border-[#223040] text-cyan-300 shrink-0">
                        {unit.id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-[#111821] text-slate-400 shrink-0">
                        {unit.industry}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {unit.region}
                      </span>
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono border shrink-0 flex items-center gap-1 ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}
                    >
                      <span>{meta.badgeEmoji}</span>
                      <span>{meta.shortLabel}</span>
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-100 truncate mb-1 group-hover:text-cyan-300 transition-colors">
                    {unit.name}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2 font-mono">
                    <span className="flex items-center gap-1 truncate">
                      <Server className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{unit.targetSystem}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleFocusUnitOnMap(unit, e)}
                      className="px-1.5 py-0.5 rounded-[2px] bg-[#111821] hover:bg-[#164e63] border border-[#223040] text-[10px] text-cyan-300 shrink-0"
                      title="在卫星图上放大定位该关基坐标"
                    >
                      卫星定位
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 中栏 (Cols 4-9)：AntV L7 + 高德卫星遥感影像（精准 GCJ-02 坐标锚定） */}
        <div className="lg:col-span-6 bg-[#0A0E13] border border-[#223040] rounded-[4px] relative flex flex-col overflow-hidden min-h-[480px]">
          {/* 地图顶部悬浮控制栏：战区视角快速聚焦（无多余模式开关，纯粹高德卫星精准定位） */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex flex-wrap items-center gap-1 bg-[#111821]/95 border border-[#223040] rounded-[4px] p-1 pointer-events-auto">
              <button
                onClick={() => handleFlyToRegion([113.8, 32.5], 3.85)}
                className="px-2 py-1 rounded-[2px] bg-[#0A0E13] hover:bg-[#164e63] text-slate-200 text-[11px] font-mono transition-colors flex items-center gap-1"
              >
                <Compass className="w-3 h-3 text-cyan-400" />
                全国卫星总览
              </button>
              <button
                onClick={() => handleFlyToRegion([121.47, 31.23], 9.6)}
                className="px-2 py-1 rounded-[2px] bg-[#0A0E13] hover:bg-[#164e63] text-slate-300 text-[11px] font-mono transition-colors"
                title="精准聚焦上海浦东(01/04)、嘉定(03)、虹桥(06) 4家关基卫星实景"
              >
                上海战区(4家精准坐标)
              </button>
              <button
                onClick={() => handleFlyToRegion([116.37, 39.93], 10.2)}
                className="px-2 py-1 rounded-[2px] bg-[#0A0E13] hover:bg-[#164e63] text-slate-300 text-[11px] font-mono transition-colors"
                title="精准聚焦北京海淀(05)、东城(09) 2家关基卫星实景"
              >
                北京战区(2家精准坐标)
              </button>
              <button
                onClick={() => handleFlyToRegion([113.78, 22.86], 8.2)}
                className="px-2 py-1 rounded-[2px] bg-[#0A0E13] hover:bg-[#164e63] text-slate-300 text-[11px] font-mono transition-colors"
              >
                大湾区(穗07/深10)
              </button>
            </div>

            <div className="bg-[#111821]/95 border border-[#223040] rounded-[4px] px-2.5 py-1 text-[10px] font-mono text-cyan-300 pointer-events-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>高德卫星实景 · GCJ-02 精准坐标 · 点击锚点进入 5 层防御拓扑</span>
            </div>
          </div>

          {/* AntV L7 + 高德卫星影像 WebGL 挂载容器 */}
          <div className="w-full flex-1 min-h-[420px] relative bg-[#070b10] overflow-hidden">
            <div
              ref={mapContainerRef}
              className="w-full h-full absolute inset-0"
            />

            {/* 10 个关基单位精准锚定发光坐标点 + 错位引线铭牌（点击直接进入该单位 5 层防御拓扑靶场） */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              {/* SVG 精准坐标引线层：连接真实经纬度锚点 (pos.x, pos.y) 与铭牌偏移位置 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {filteredUnits.map((unit) => {
                  const pos = projectedCoords[unit.id];
                  if (!pos) return null;
                  const [dx, dy] = unit.labelOffset;
                  const meta = STATUS_META[unit.status];
                  return (
                    <g key={`leader-${unit.id}`}>
                      <line
                        x1={pos.x}
                        y1={pos.y}
                        x2={pos.x + dx}
                        y2={pos.y + dy}
                        stroke={meta.hex}
                        strokeWidth={unit.id === selectedUnitId ? 1.6 : 1.1}
                        strokeDasharray={unit.status === 'green' ? undefined : '3 2'}
                        opacity={0.85}
                      />
                    </g>
                  );
                })}
              </svg>

              {filteredUnits.map((unit) => {
                const pos = projectedCoords[unit.id];
                if (!pos) return null;
                const isSelected = unit.id === selectedUnitId;
                const meta = STATUS_META[unit.status];
                const [dx, dy] = unit.labelOffset;
                const isLeftOffset = dx < 0;

                return (
                  <div
                    key={unit.id}
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      zIndex: isSelected
                        ? 100
                        : unit.status === 'red'
                        ? 60
                        : unit.status === 'yellow'
                        ? 40
                        : 20,
                    }}
                    className="absolute pointer-events-none"
                  >
                    {/* 1. 严格位于真实经纬度 (pos.x, pos.y) 的三态发光呼吸灯圆点 */}
                    <button
                      type="button"
                      onClick={() => handleOpenUnitTopology(unit)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer pointer-events-auto focus:outline-none group"
                      title={`点击进入 [${unit.id} ${unit.name}] 专属 5 层防御结构资产拓扑图`}
                    >
                      {unit.status === 'red' ? (
                        <>
                          <span className="absolute -inset-3 rounded-full border-2 border-rose-500 ciio-wave-ring-red pointer-events-none" />
                          <span
                            className="absolute -inset-1.5 rounded-full bg-rose-500/40 ciio-wave-ring-red pointer-events-none"
                            style={{ animationDelay: '0.45s' }}
                          />
                          <span className="relative w-4 h-4 rounded-full bg-rose-500 border-2 border-white ciio-strobe-core-red flex items-center justify-center text-[8px] font-mono font-bold text-white">
                            {unit.id}
                          </span>
                        </>
                      ) : unit.status === 'yellow' ? (
                        <>
                          <span className="absolute -inset-2.5 rounded-full border border-amber-400 bg-amber-400/25 ciio-pulse-ring-yellow pointer-events-none" />
                          <span className="relative w-3.5 h-3.5 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center text-[8px] font-mono font-bold text-slate-950">
                            {unit.id}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="absolute -inset-1 rounded-full border border-emerald-400/60 bg-emerald-500/15 pointer-events-none" />
                          <span className="relative w-3.5 h-3.5 rounded-full bg-emerald-400 border border-slate-950 flex items-center justify-center text-[8px] font-mono font-bold text-slate-950">
                            {unit.id}
                          </span>
                        </>
                      )}
                    </button>

                    {/* 2. 引线末端的关基单位铭牌（点击同样直接跳转该单位专属 5 层防御拓扑子页面） */}
                    <button
                      type="button"
                      onClick={() => handleOpenUnitTopology(unit)}
                      style={{
                        left: `${dx}px`,
                        top: `${dy}px`,
                      }}
                      className={`absolute -translate-y-1/2 ${
                        isLeftOffset ? '-translate-x-full' : 'translate-x-0'
                      } px-1.5 py-0.5 rounded-[4px] bg-[#0A0E13]/95 border ${
                        isSelected
                          ? 'border-cyan-400 ring-1 ring-cyan-400'
                          : unit.status === 'red'
                          ? 'border-rose-500/85'
                          : unit.status === 'yellow'
                          ? 'border-amber-500/75'
                          : 'border-[#223040]'
                      } flex items-center gap-1.5 whitespace-nowrap cursor-pointer pointer-events-auto transition-transform hover:scale-105 hover:border-cyan-400 focus:outline-none`}
                      title={`点击进入 [${unit.id} ${unit.name}] 专属 5 层防御结构资产拓扑图`}
                    >
                      <span className={`font-mono text-[10px] font-bold ${meta.textClass}`}>
                        {unit.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-100">
                        {unit.shortName}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1 rounded-[2px] ${meta.bgClass} ${meta.textClass}`}
                      >
                        {meta.shortLabel}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 地图左下角：坐标点呼吸灯状态图例（按防线被击穿深度实时变色） */}
          <div className="absolute bottom-2 left-2 z-20 bg-[#111821]/95 border border-[#223040] rounded-[4px] p-2.5 space-y-1 max-w-xs pointer-events-auto">
            <div className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5 border-b border-[#223040] pb-1">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              坐标点呼吸灯状态（按防线被击穿深度变色）
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  🟢 绿色常亮（防线稳固）
                </span>
                <span className="text-[10px] font-mono text-slate-400">0 层击穿 · 全线受控</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ciio-pulse-ring-yellow inline-block" />
                  🟡 黄色脉冲（边界失守）
                </span>
                <span className="text-[10px] font-mono text-slate-400">DMZ/外围边界突破</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ciio-strobe-core-red inline-block" />
                  🔴 红色爆闪（重大隐患）
                </span>
                <span className="text-[10px] font-mono text-slate-400">核心库/PLC 控制击穿</span>
              </div>
            </div>
          </div>

          {/* 地图右下角：公安部督导飞线说明 */}
          <div className="absolute bottom-2 right-2 z-20 bg-[#111821]/95 border border-[#223040] rounded-[4px] px-2.5 py-1.5 text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Crosshair className="w-3 h-3" />
              公安部网安保卫局监管总中心 (北京)
            </div>
            <div className="text-slate-400">
              点击任一关基坐标点 → 直接进入该单位 5 层防御结构拓扑靶场
            </div>
          </div>
        </div>

        {/* 右栏 (Cols 10-12)：选中关基单位公安监管档案与 5 层防御结构概览 */}
        <div className="lg:col-span-3 bg-[#111821] border border-[#223040] rounded-[4px] flex flex-col justify-between p-3.5 overflow-y-auto space-y-3">
          <div className="space-y-3">
            {/* 单位头部卡片 */}
            <div className="border-b border-[#223040] pb-2.5 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#0A0E13] border border-cyan-500/40 text-cyan-300 whitespace-nowrap">
                  编号 #{selectedUnit.id} · {selectedUnit.industry}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-[4px] font-mono text-[11px] font-bold border whitespace-nowrap ${
                    STATUS_META[selectedUnit.status].bgClass
                  } ${STATUS_META[selectedUnit.status].borderClass} ${
                    STATUS_META[selectedUnit.status].textClass
                  }`}
                >
                  {STATUS_META[selectedUnit.status].badgeEmoji}{' '}
                  {STATUS_META[selectedUnit.status].label}
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-100 leading-snug">
                {selectedUnit.name}
              </h2>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{selectedUnit.region}</span>
                <span>·</span>
                <span className="tabular-nums text-cyan-300">
                  GCJ-02 [{selectedUnit.lngLat[0].toFixed(4)}°E, {selectedUnit.lngLat[1].toFixed(4)}°N]
                </span>
              </div>
            </div>

            {/* 核心保护资产靶标 */}
            <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>核心关基保护靶标</span>
                <span className="font-mono text-cyan-400">一级重点保护</span>
              </div>
              <div className="text-xs font-bold text-cyan-300 font-mono">
                {selectedUnit.targetSystem}
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-[#223040]">
                属地公安监管：{selectedUnit.policeJurisdiction}
              </div>
            </div>

            {/* 5 层纵深防御结构击穿态势尺 (外部 -> DMZ -> 管理区 -> 控制区 -> 现场区) */}
            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  5 层防御结构实时态势
                </span>
                <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                  击穿深度: {selectedUnit.penetrationDepth} 层
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 font-mono text-[10px] text-center">
                {[
                  { step: 1, name: '外部' },
                  { step: 2, name: 'DMZ' },
                  { step: 3, name: '管理区' },
                  { step: 4, name: '控制区' },
                  { step: 5, name: '现场区' },
                ].map((layer, idx) => {
                  const isBreached =
                    (selectedUnit.status === 'yellow' && idx <= 1) ||
                    (selectedUnit.status === 'red' && idx <= 4);
                  return (
                    <div
                      key={layer.step}
                      className={`p-1.5 rounded-[2px] border ${
                        isBreached
                          ? selectedUnit.status === 'red'
                            ? 'bg-rose-950/90 border-rose-500 text-rose-300 font-bold'
                            : 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                          : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400'
                      }`}
                    >
                      <div>{layer.name}</div>
                      <div className="text-[9px] mt-0.5">
                        {isBreached ? '⚠️失守' : '✓稳固'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-[#223040]">
                <span className="text-slate-400">当前防线判定：</span>
                <span className={STATUS_META[selectedUnit.status].textClass}>
                  {selectedUnit.breachedZoneText}
                </span>
              </div>
            </div>

            {/* 公安监管通报摘要与指标 */}
            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-2">
              <div className="grid grid-cols-2 gap-2 font-mono border-b border-[#223040] pb-2">
                <div>
                  <div className="text-[10px] text-slate-400">综合防御拦截率</div>
                  <div className="text-base font-bold text-cyan-300 tabular-nums">
                    {selectedUnit.defenseRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">本轮活跃告警数</div>
                  <div
                    className={`text-base font-bold tabular-nums ${
                      selectedUnit.status === 'red'
                        ? 'text-rose-400'
                        : selectedUnit.status === 'yellow'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedUnit.activeAlerts} 条
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-semibold">实网攻防通报：</span>
                {selectedUnit.incidentSummary}
              </div>
            </div>
          </div>

          {/* 底部主操作：进入该关基单位专属 5 层防御结构资产拓扑靶场子页面 */}
          <div className="pt-2 border-t border-[#223040] space-y-2">
            <button
              type="button"
              onClick={() => handleOpenUnitTopology(selectedUnit)}
              className="w-full py-2.5 px-3 rounded-[4px] bg-[#164e63] hover:bg-[#155e75] border border-cyan-400 text-cyan-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Network className="w-4 h-4 text-cyan-300" />
              进入 [{selectedUnit.shortName}] 5层防御资产拓扑靶场
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCampaign(selectedUnit.linkedCampaignCode);
                onOpenArbitration();
              }}
              className="w-full py-1.5 px-3 rounded-[4px] bg-[#0A0E13] hover:bg-[#16273b] border border-[#223040] text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              调阅该单位六态仲裁审计 ({selectedUnit.linkedCampaignCode})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
