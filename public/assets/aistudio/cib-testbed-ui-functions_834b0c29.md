# 关基防御测试平台 UI 功能需求清单

| 项 | 内容 |
|---|---|
| 依据 | `cib-defense-test-platform-design.md` v1.0、`cib-defense-testbed` MVP 实现 |
| 日期 | 2026-11-08 |
| 组织方式 | 按“界面承担的职责”分组，不描述画稿 |
| 标记 | `[现有]` 当前后端可直接支撑；`[适配]` 后端有数据但需补接口/映射；`[新增]` 后端尚无对应能力 |

> 一句话定位：UI 是**测试活动的控制台与门禁面板**，不是判据本体，也不是攻击执行器。
> 它负责“编排输入、发起与观察、展示证据与结论、留痕与签字”，不负责“算出结论”。

---

## 0. 六条设计约束（决定哪些功能能放 UI）

1. **判定只读**：`judge.py` 的 E/R/O 与六态结果是确定性产物，UI 不得直接改判；只能提异议、走复核与覆盖审计。
2. **输入即代码**：场景、DEM、防御基线都是版本化制品；UI 的编辑最终落到 YAML/冻结快照，并产生 hash。
3. **门禁先于运行**：校验 → DEM 完整性 → 阳性探针 → 隔离/时钟 → 运行 → 证据完整 → 评分 → 签字，逐级阻断。
4. **单次运行不作结论**：设计假设 A5 要求每组配置重复 ≥5 次；UI 必须常驻“单次运行仅作案例”的提示。
5. **职责分离**：作者、复核人、签字人分开；作者不能自批，判据维护者不能改自己活动的结论。
6. **实时性是后补能力**：当前 `execute_run` 是同步执行、结束后一次性落盘，没有逐步事件流；UI 的“实时进度”必须明确标注为二期能力。

---

## 1. 后端能力与 UI 可用性对照

| 后端能力 | 现状 | UI 能做什么 | 缺口 |
|---|---|---|---|
| 场景加载/校验 | `scenario.py`：`load_scenario`、`validate_scenario`（技术、依赖环、objective 证据） | 编辑器校验、错误列表 | 错误无行号；YAML 注释回写难 |
| DEM 编译/校验 | `dem.py`：`resolve_dem`、`validate_dem`、`dem_coverage` | 矩阵展示、折算预览、门禁 | 单元格不可直接持久化覆盖 |
| 攻击编排 | `agents/planner.py`、`orchestrator.py`、`roles.py` | 契约/决策/攻击图只读视图 | 无人工派发、无逐步事件流 |
| 执行 | `agents/executor.py::MockExecutor` | 运行发起、结果查看 | 无暂停/回滚；异常分类弱 |
| 归一化/事件化 | `siem.py::normalize` | 告警流、关联缺口展示 | 是模拟裁判 SIEM，非真实独立 SIEM |
| 证据 | `evidence.py::EventStore`、`evidence_ledger` | E/R/O 证据查看、哈希校验 | 无证据强度的人工标注存储 |
| 判定 | `judge.py::evaluate` | 三层明细、六态展示 | 无结论覆盖/复核存储 |
| 归因/指标 | `attribution.py`、`metrics.py` | 最小失效集、系统下钻、口径说明 | 无跨活动对比 |
| 评分卡/报告 | `scoring.py`、`report.py`、`runner.rebuild_report` | 三卡展示、报告预览、重建 | 无 PDF、无签字流 |
| 活动/权限/审计 | 无 | — | 全部需新增 |
| 实时流/队列 | 无 | — | 全部需新增 |
| 拓扑/复位/探针 | 仅有 `defense_baseline.probe`（系统级） | 系统级健康展示 | 无拓扑模型、无单元格级探针、无三级复位 |

---

## 2. 功能清单

### 2.1 测试活动管理（ACT）

界面职责：把“一次测试”作为可治理的对象管理起来；活动是场景、基线、运行、报告的容器。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **ACT-01 创建活动** | 选择业务类、保真度、模板或空白，填写活动名与目标，生成草稿 | `configs/defense_systems.yaml`、`scenarios/*`、活动元数据 | 活动草稿：`activity_id`、`business_class`、`fidelity`、`scenario_id`、负责人 | `cli.py::_TEMPLATES`、`scenario.py` `[现有]`；活动存储 `[新增]` | 有 author 权限；`scenario_id` 全局唯一 | B2 无模板/无 demo，必须禁选并说明“规划中”；ID 冲突；写盘失败 |
| **ACT-02 选择防御基线快照** | 从基线库选择 10 个系统实例（mode/version/coverage/actions/latency/probe/correlate），或从历史活动复制 | 基线库、历史活动快照、`configs/defense_systems.yaml` | `baseline_snapshot_id` 绑定到活动（不直接改场景） | `scenario.py` 解析 `defense_baseline` `[现有]`；基线库 `[新增]` | 系统必须在目录；`mode`/`actions` 合法；tap 必须提示折算 | 未知 DS；非法 mode/actions；缺 `probe`；快照被引用后不可原地改，只能新建版本 |
| **ACT-03 复制历史活动** | 以历史活动为模板新建，复制场景、基线、DEM 输入，不复制运行结果与结论 | 源活动 `manifest.json`、`scenario.yaml`、`dem.resolved.yaml`、`scorecards.json` | 新活动 + 新 `scenario_id`/`version`；复制记录 | `runner.py` 产物读取 `[现有]`；克隆逻辑 `[新增]` | 源活动可读；目标 ID 唯一；源未处于运行中 | 版本冲突；源已作废；复制后误带旧结论——UI 必须显式清空 run 关联 |
| **ACT-04 活动状态流转** | 草稿 → 待审 → 已批准 → 排队 → 运行中 → 已完成；任一阶段可作废 | 活动状态、门禁结果、审批记录 | `status`、`actor`、`reason`、时间戳（追加式审计） | 活动状态机 `[新增]`；`execute_run` 仅允许在“已批准”后调用 | 提交评审需校验 + DEM 门禁 + 探针通过；作废需先终止运行；审批人不能是作者 | 门禁未过；越权审批；并发状态冲突（需乐观锁）；已批准后修改输入必须自动退回草稿 |
| **ACT-05 活动列表 / 检索 / 对比入口** | 按业务类、状态、负责人、时间筛选；进入运行历史与对比 | 活动索引、`runs/*/manifest.json`、评分卡 | 仅用户视图偏好；对比选择集 | 目录扫描可只读实现 `[适配]`；索引 `[新增]` | 无 | 索引滞后；无权查看他人活动；空态需引导“创建第一个活动” |

**说明**：把“选择防御基线”放在活动层（ACT-02），把“逐系统参数编辑”放在靶场层（ENV-02），避免同一份 `defense_baseline` 出现两个写入口。

---

### 2.2 场景编排（SCN）

界面职责：让用户安全地改写 `scenario.yaml`，并在写错时立刻知道错在哪；不承担攻击载荷构造。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **SCN-01 YAML / 表单双模式** | 文本模式精修，表单模式结构化编辑；切换不丢字段 | `scenario.yaml`、字段 schema（`ScenarioStep` / `Scenario`） | `scenario.yaml` 草稿 | `scenario.py` 加载模型 `[适配]` | 有编辑权限；场景未冻结 | YAML 语法错误需定位行号；表单未覆盖字段（如 `simulate`、`seeds`）必须保留原文，不能静默删除；并发编辑冲突 |
| **SCN-02 步骤增删与排序** | 新增/删除/复制攻击步；调整 `t_start_s`、`effect_s`、`depends_on` | `steps`、`negative_controls`、`all_steps` 排序 | 步骤字段：`step_id`/`technique`/`asset`/`role`/`t_start_s`/`effect_s`/`reach`/`objective`/`objective_evidence`/`depends_on`/`simulate`/`evasion_strategy` | `scenario._parse_step`、`validate_scenario` `[现有]` | `step_id` 唯一；objective 步必须有 `objective_evidence`；依赖步存在 | 重复 ID；依赖不存在；删除被依赖步需列出引用并阻断；时间倒挂只警告不阻断 |
| **SCN-03 ATT&CK / ICS 技术选择** | 搜索技术，查看 tactic/矩阵/类别，选择后预览主责/次责系统 | `configs/techniques.yaml`（技术 + 类别映射）、`configs/defense_systems.yaml` | `step.technique`（跨 IT/OT 按 R1 拆场景，不做单场景跨类） | `scenario.load_techniques`、`dem` 类别映射 `[现有]` | 技术已收录；B1 选 Enterprise、B3 选 ICS | 未收录编号；矩阵不匹配；B2 场景禁止向 PLC/RTU 下发控制指令；跨类技术不得塞进同一场景 |
| **SCN-04 期望拦截点与达成证据绑定** | 为每步声明 `objective_evidence`、`reach`、`objective`，并查看由 DEM 推导出的期望系统 | `models.STRONG_EVIDENCE`/`MEDIUM_EVIDENCE`/`WEAK_EVIDENCE`、DEM 预览 | `objective_evidence` 列表、`reach`、`objective`；期望系统只读 | `models.py` 证据分级、`dem.resolve_dem` `[现有]`；强度门禁需 UI 补 `[新增]` | objective 步至少 1 条证据（后端只校验非空）；建议至少 1 条强/中证据，弱证据不能单独支撑 O | 只选弱证据：后端不报错但判定 O 不成立，UI 要提前警告而非阻断；缺证据类型；技术类别无映射 → DEM 该步无 MUST/SHOULD |
| **SCN-05 依赖图编辑与环检测** | 拖拽连边改 `depends_on`，实时检查 DAG | `steps.depends_on`、`graph.json` | `depends_on` 列表 | `scenario.validate_scenario` 的 DFS 环检测、`planner.AttackGraph` `[现有]` | 只能引用同场景步；不能引用负对照步 | 成环（需报环路径）；自依赖；跨场景依赖；MVP 只支持普通 `depends_on`，UI 不得暗示支持“超边/多前置”语义 |
| **SCN-06 一键校验与错误定位** | 保存前/运行前校验，错误可点击跳转到步/字段 | 场景文件、`ConfigError` 文本、DEM 校验结果 | 无（只读校验）；可选修复建议 | `runner.load_environment`、`validate_scenario`、`validate_dem` `[适配]` | 文件可解析 | `ConfigError` 目前无行号，需 UI 建“文本范围 → 行号”映射；多条错误需分级；修复后必须重跑全部门禁 |
| **SCN-07 负对照编辑** | 添加正常业务步，设置误报模拟；确保只产生 `MUST_NOT_TRIGGER`/`N/A` | `negative_controls`、DEM 负对照规则 | 负对照步；`simulate.false_positive`（仅靶场） | `scenario._parse_step(negative=True)`、`dem.resolve_dem` 负对照分支、`validate_dem` `[现有]` | 负对照不参与 objective；建议每个场景至少 1 条 | 负对照设 `objective=true` 当前后端不报错，需 UI 新增门禁；技术字段缺省时才填 `BENIGN`，填了其他编号会原样保留，UI 建议锁定为 `BENIGN`；误报开关不得出现在生产配置 |

---

### 2.3 DEM 期望矩阵编辑（DEM）

界面职责：把“10 系统 × 攻击步”的期望改对、改全，并保证折算规则不被绕过。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **DEM-01 矩阵总览** | 以 10×N 网格查看每步每系统的期望、部署模式、SLA、N/A 与负对照行 | `dem.resolved.yaml`、`dem_coverage` 统计 | 无 | `dem.resolve_dem`、`dem_coverage` `[现有]` | 场景校验通过 | 无攻击步；编译失败；`required_systems` 未部署需高亮“将判 I” |
| **DEM-02 单元格编辑** | 修改期望/SLA/备注；人工 override 必须留理由 | DEM 单元格、来源（主责/次责/跨层自动追加/负对照） | 仅允许写“输入层”（基线 mode/coverage 或类别映射）；直接单元格覆盖 `[新增]` | `dem._primary_expectation` / `_secondary_expectation` `[适配]` | 有评审权限；override 理由必填 | 当前 `dem.resolved.yaml` 是编译产物，直接改会在重算时丢失——UI 必须明确“编辑基线/映射”与“覆盖单元格”是两条路径，后者需新增存储 |
| **DEM-03 部署模式折算提示** | 把某系统改为 `tap` 时，实时预览 `MUST_BLOCK → MUST_DETECT` 与 `architecture_adjusted=true` | `defense_systems.yaml` 的 `can_prevent`、当前单元格 | `defense_baseline` 的 `mode`；折算结果由后端计算，不手写 | `dem._primary_expectation`、`attribution` 架构约束 `[现有]` | 系统具备 `prevent` 能力 | 用户强行保留 `MUST_BLOCK` → 校验拒绝；tap 仍配置 `block` action → 警告该动作无效 |
| **DEM-04 矩阵完整性门禁** | 运行前检查：每步至少一个 MUST/SHOULD、负对照只允许 MUST_NOT_TRIGGER/N/A、无非法组合 | `validate_dem` 结果、`dem_coverage` | 无（阻断运行） | `validate_dem`、`load_environment` `[现有]` | 场景已保存且可编译 | 错误必须能定位到“步 + 系统”；无法定位时显示原文；门禁失败不得进入运行 |
| **DEM-05 DEM 版本与差异** | 冻结 DEM 快照，和上一版对比，确认变更已评审 | `dem.resolved.yaml`、`scenario.version`、`manifest.json` | 冻结记录（hash）、评审标记 | `dem_to_dict`、`sha256_file` `[现有]`；diff `[新增]` | 场景版本已递增 | 同版本重复冻结冲突；未评审冻结；差异只显示“单元格变化”不显示理由 → 需补理由字段 |

**关键规则**：`tap` 的折算必须发生在人工编辑之前；UI 不允许把折算结果当普通单元格再改回 `MUST_BLOCK`。

---

### 2.4 运行与监控（RUN）

界面职责：把一次运行从“发起”到“可观察”再到“异常处置”管住；不承担攻击执行与隔离守卫。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **RUN-01 启动运行** | 选择已批准活动、场景版本、`coverage`/`efficacy`、种子、`run_id`，确认禁做项后启动 | 活动状态、场景 hash、DEM、基线快照 | 运行请求、`run_id`、执行器记录；不直接写判分 | `runner.execute_run` `[现有]`；任务队列 `[新增]` | 活动已批准；三层门禁通过；`run_dir` 不存在或显式 `force`；隔离守卫在线 | `FileExistsError`；门禁未过；worker 忙；执行器异常；重复提交需幂等键 |
| **RUN-02 暂停 / 停止 / 回滚** | 终止当前运行；回到运行前快照；基于同一配置重跑 | 运行状态、快照清单、复位记录 | 停止请求、`status=aborted`、回滚记录 | 当前无中断点 `[新增]`；三级复位属设计 4.6、MVP 未实现 | 有运行中任务；快照可用；有操作权限 | MVP 只能“终止”，不能“暂停”；历史终态不可回滚；复位不彻底 → 本轮标 `INVALID`，不得出结论 |
| **RUN-03 进度与当前步** | 看当前步、已完成/剩余、耗时、预算；`efficacy` 模式下显示“链路暂停（未执行≠不可判定）” | 实时事件流、`decisions.json`、`events.jsonl` | 无 | `orchestrator.run_scenario` `[适配]`；流式事件 `[新增]` | 运行已启动 | 当前 `execute_run` 同步执行、结束才落盘，运行中无进度可读——UI 需先显示“执行中（阶段性产物不可用）”；断线重连需全量补齐 |
| **RUN-04 智能体协作视图** | 查看 9 个角色、任务契约、决策序列、攻击图节点与边 | `contracts.json`、`decisions.json`、`graph.json`、`roles.py` | 无（只读）；不做人工派发 | `planner.plan`、`AttackGraph`、`orchestrator`、`roles` `[现有]` | 已规划或已产生产物 | 决策记录是摘要，不能重放 LLM；`attack_effect` 属攻击侧，需脱敏或限权 |
| **RUN-05 防御告警流** | 按系统/步/严重度过滤 raw 告警、归一化告警、阻断、事件；查看关联缺口 | `events.jsonl`、`siem.json`；可选 `deploy/` 的 Loki API | 无 | `siem.normalize`、`EventStore` `[现有]`；实时流 `[新增]` | 运行中或已完成；明确 `judge_siem` 类型 | 当前是 `simulated-normalizer`，UI 必须标“模拟归一化”，不能冒充真实独立 SIEM；Loki 断连；告警风暴需分页/聚合 |
| **RUN-06 异常与中断处置** | 处理探针失败、执行器异常、证据断链、I 比例超阈值；选择中止/重跑/标无效 | 错误日志、`probe`、`metrics.scenario.inconclusive_rate` | 处置结论、`status`、原因、操作人 | `validate` / `runner` `[适配]`；错误分类 `[新增]` | 有 review 权限 | 错误不可归类；重跑覆盖原目录需 `force` + 审计；不得把“环境故障”记成“防御漏检” |
| **RUN-07 日志与原始事件查看** | 按 `step_id`/`kind`/`source`/时间查看事件 `data`，导出取证包 | `events.jsonl`、`manifest.json`、`evidence_ledger` | 导出任务（只读） | `EventStore.from_jsonl`、`evidence_ledger` `[现有]` | 产物存在；字段权限过滤 | 大文件分页；文件缺失；hash 不匹配；`attack_effect` 需脱敏/限权 |
| **RUN-08 运行队列** | 排队、取消排队、限制并发、看到等待原因 | 队列状态、资源配额 | 队列项 | `[新增]` | 有发起权限；配额可用 | 饥饿；重复 `run_id`；队列与活动状态不一致 |

---

### 2.5 证据与判定（EVD）

界面职责：让“为什么这样判”可追溯；允许对不可判定做人工复核，但不允许直接改判。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **EVD-01 E/R/O 三层视图** | 逐步查看 E/R/O 布尔、`reasons`、`evidence_refs`，跳到原始事件 | `verdicts.json`、`events.jsonl`、`evidence_ledger` | 无 | `judge.evaluate`、`StepVerdict.to_dict` `[现有]` | 判定已生成 | `I` 时 E/R/O 是“未知”，不得显示为 false；证据引用缺失需高亮；负对照不显示六态 |
| **EVD-02 证据强度标注** | 展示强/中/弱证据；标注“弱证据不可单独支撑 O” | `models.STRONG_EVIDENCE` / `MEDIUM_EVIDENCE` / `WEAK_EVIDENCE`、事件 `data` | 证据备注（不改强度） | `models.py`、`judge` 仅采信强/中 `[现有]`；备注存储 `[新增]` | 证据类型在目录内 | 未知 `evidence_type` 按弱处理并告警；用户试图把弱证据提升为强 → 拒绝 |
| **EVD-03 不可判定人工复核** | 查看 `inconclusive_reason`（必测未部署/探针失败/关联能力不可用/未执行），记录复核结论 | `verdicts.json` 的 `inconclusive_reason`、`metrics.scenario.inconclusive_rate`、`probe` | 复核记录：接受 I / 请求重跑 / 标记环境缺陷 | `judge` / `attribution` `[现有]`；复核存储 `[新增]` | reviewer 权限；能定位到具体原因 | 复核不能把 I 直接改成 S/D；`step_not_executed`（efficacy 暂停）不是 I，不得混入；缺原因时禁止复核 |
| **EVD-04 结论异议与修改审计** | 对 S/P1/P2/D1/D2/D3 提异议，附证据，审批后产生“覆盖结论” | 原判定、证据、指标、`dem.resolved.yaml` | 覆盖记录：原值/新值/理由/证据引用/提出人/审批人/时间 | 判据不可变 `[现有]`；覆盖层 `[新增]` | 异议人 ≠ 审批人；证据完整；覆盖必须引用证据 ID | 自批自改；无证据覆盖；覆盖后指标必须重算并提供重算记录，当前无此入口 |
| **EVD-05 证据完整性 / 哈希校验** | 校验 manifest 中产物 hash、报告 hash、证据链是否完整 | `manifest.json`、`sha256_file`、`evidence_ledger` | 校验结果（只读） | `runner` 产物、`util.sha256_file`、`evidence_ledger` `[现有]` | 运行已完成且产物齐全 | 缺字段；hash 不匹配 → 阻断导出与签字；证据链断点需定位到事件 |

---

### 2.6 归因与指标（ATT）

界面职责：把“哪个系统该负责”和“指标怎么算”讲清楚，避免评审误读。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **ATT-01 最小失效集展示** | 查看每步缺失动作、最小失效集、主责/次责、架构约束 | `attribution.json`：`failed_systems`、`primary_counts`、`architecture_constraints`、`root_causes` | 无 | `attribution.attribute` `[现有]` | 存在 `S`/`P1`/`D3` 步 | UI 需说明“无告警时不归因 DS-10”（后端已实现该规则）；同一根因跨步需合并展示，不能重复计数 |
| **ATT-02 单系统下钻** | 查看 DS 卡：FNR/BR/ER、时延 p50/p95/max、SLA 违约、FPR、主次责、部署模式 | `metrics.json.systems`、`scorecards.json.systems` | 无 | `metrics.compute_metrics`、`scoring.build_scorecards` `[现有]` | 该系统有非 I 的可执行步 | 分母为 0 显示 `N/A` 而不是 `0%`；`absent` 系统显示“未部署”，不进入评分；tap 系统需单独标“架构约束” |
| **ATT-03 指标口径说明** | 查看公式、分母、排除项（I/NEG/OBSERVE_ONLY/未执行），看到单次运行警示 | 指标字典、设计文档 5.7、`metrics` 的统计范围 | 无 | `metrics.py`、`scoring.py` `[适配]` | 无 | 文案与后端口径不一致；Wilson 区间未实现必须标注；把 `I` 算进分母属严重误导 |
| **ATT-04 跨活动对比** | 同场景、同配置不同版本对比三率/时延/判定分布 | 多 run 的 `metrics.json`、`scorecards.json`、`manifest.json`（`scenario_sha256`、`config_sha256`、`seeds`） | 对比视图/导出 | `[新增]`；现有 JSON 可先做客户端对比 | `scenario_id`/`business_class`/`fidelity` 一致；建议重复 ≥5 次 | 配置 hash 不同 → 标“不可比”；单次运行禁止下结论；把不同业务类比在一张图 → 阻断 |
| **ATT-05 根因合并与归类** | 查看平台级根因（日志未接入、时钟偏移、探针失败），人工归类 | `attribution.root_causes`、`architecture_constraints` | 根因标签、备注（需审计） | `attribution` `[现有]`；分类字典 `[新增]` | 有归因结果；有 review 权限 | 标签冲突；跨活动合并不一致；归类不得改变原始归因记录 |

---

### 2.7 评分卡与报告（RPT）

界面职责：把结论变成可签字、可复核、可导出的制品；报告只能重建，不能手改。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **RPT-01 生成/查看三张评分卡** | 查看场景卡、系统卡、平台卡；检查每个 `S`/`D3` 是否有证据引用 | `scorecards.json`、`verdicts.json`、`manifest.json` | 评分卡快照（hash） | `scoring.build_scorecards` `[现有]` | 判定完成且证据可读 | 证据缺失 → 卡片标“不可签字”；平台卡的 `reproducibility=not_measured_single_run`、`defaults_pending=true` 必须显式展示，不能隐藏 |
| **RPT-02 报告预览** | 预览 Markdown 报告：摘要、范围/假设、时间线、归因、指标、限制、复现清单 | `report.md`、`manifest.json` | 无（禁止直接编辑） | `report.generate_report`、`runner.rebuild_report` `[现有]` | 报告已生成或可重建 | 重建依赖 `manifest.scenario_path` 与 `config_dir`，文件移动会失败；缺 `siem.json`；报告与 manifest hash 不一致 |
| **RPT-03 导出** | 导出 Markdown/JSON/CSV；PDF 作为二期 | `report.md`、`scorecards.json`、`metrics.json` | 导出任务、下载审计记录 | Markdown/JSON `[现有]`；PDF/脱敏 `[新增]` | 哈希校验通过；有导出权限 | 含受限证据需脱敏或拒绝；PDF 引擎缺失；导出后文件被篡改无法追责 |
| **RPT-04 版本留痕** | 查看报告版本、`report_sha256`、重建历史；保留签字版 | `manifest.json`、文件 hash、重建记录 | 重建记录（追加式） | `rebuild_report` `[现有]`；版本记录 `[新增]` | 原始产物完整 | 重建后 hash 变化需提示“报告已变更”；不得覆盖已签字版本；删除产物后重建失败 |
| **RPT-05 历史报告对比** | 同场景不同版本对比判定分布、指标、归因与失效模式 | 多 run 的报告与 manifest | 对比标记 | `[新增]` | 场景/业务类/保真度一致 | 版本或配置不一致；对比结果与签字版脱节 |
| **RPT-06 发布与签字** | 提交评审、签字生效、撤回；记录签字人与 manifest hash | 评分卡、证据完整性、门禁状态、`I` 比例 | 签字记录（人、时间、hash、结论等级） | 审批流 `[新增]` | 证据完整；无未复核 I；`defaults_pending` 已确认；R3 阈值（I≤10%）满足或降级为观察报告 | 越权签字；hash 不匹配；作者自签；I 超阈值仍签“系统级结论” |

---

### 2.8 靶场与部署（ENV）

界面职责：让“测试对象与环境是否可信”可见可控；不承担靶场编排引擎。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **ENV-01 拓扑查看** | 查看资产、区域、防御系统部署位置与关键链路 | 场景 `steps.asset` 集合、`defense_baseline` 的 `face`；设计 `topology.ref`（MVP 未实现） | 拓扑文件（若引入） | 拓扑模型 `[新增]` | 场景声明 `topology` | 无拓扑字段时只能展示“由步与部署面推导的视图”，必须标注非真实拓扑，不能画成权威图 |
| **ENV-02 防御基线编辑** | 逐系统设置 `mode`/`version`/`coverage`/`actions`/`latency_s`/`probe`/`correlate` | `configs/defense_systems.yaml` 默认值、场景当前基线 | `scenario.defense_baseline`（随场景版本冻结） | `scenario.load_scenario` `[现有]` | `mode` 合法；`coverage` 技术已收录；`actions` ∈ alert/block/correlate | 未知 DS；tap 配 block；`probe` 缺失默认 pass 属危险默认，UI 应显式要求确认 |
| **ENV-03 阳性探针门禁** | 每个 `MUST_*` 单元格先验证“防御系统看得见”，失败则该格判 I | `defense_baseline.probe`（当前系统级）、设计 6.3 | 探针结果、放行/阻断决定 | `probe`/`sensor_down` `[现有]`；单元格级探针 `[新增]` | 靶场已部署；探针可执行 | 探针失败 → 阻断运行并标 I；当前只有系统级探针，UI 必须标“粒度不足，不能证明每格可见” |
| **ENV-04 环境健康检查** | 检查拓扑、SIEM 就绪、时钟偏差、隔离守卫、sink 收包 | `deploy/` 的 Loki `/ready`、`siem.sh status`；`manifest` 时钟信息（MVP 无） | 健康快照 | 健康检查 `[新增]`；`deploy` 脚本可复用 `[适配]` | 环境网络可达；有运维权限 | 超时；无权限；时钟未同步；把“SIEM 未就绪”当成“防御未告警”属严重错误 |
| **ENV-05 复位 / 回滚** | 执行三级复位（容器/应用数据/OT 过程）并校验幂等 | 快照清单、复位脚本、资产指纹基线 | 复位记录、校验结果 | 设计 4.6，MVP 未实现 `[新增]` | 快照存在；有运维权限 | 复位不彻底 → 本轮 `INVALID`；幂等失败；未校验就允许运行 |

---

### 2.9 通用能力（GEN）

界面职责：权限、审计、批量、导入导出、空态、刷新；这些是平台可信度的底座。

| ID / 功能 | 用户要完成什么 | 读取数据 | 写回数据 | 后端模块 / 现状 | 前置条件 | 失败态 |
|---|---|---|---|---|---|---|
| **GEN-01 权限与角色** | 分配 viewer/author/reviewer/approver/admin；控制“谁能改输入、谁能复核、谁能签字” | 用户身份、活动归属、角色表 | 角色分配（审计） | 无认证 `[新增]` | 接入 SSO/LDAP 或本地账号；私有化部署 | 未登录；越权；作者与审批人同一人；判据维护者审自己活动 |
| **GEN-02 操作审计** | 查看并导出所有写操作：创建/编辑/校验/运行/复核/覆盖/签字/导出 | 追加式审计日志 | 审计记录：actor、action、对象、前后值摘要、理由、时间 | `[新增]` | 所有写 API 强制带 actor/reason | 审计缺失 → 禁止签字；日志可篡改 → 需 WORM/哈希链；审计含敏感载荷需脱敏 |
| **GEN-03 批量操作** | 批量改 DEM、批量重跑、批量导出 | 选中集合、门禁状态 | 批量任务（逐项审计） | `[新增]` | 有权限；每项过门禁 | 部分成功需事务语义；批量覆盖需二次确认；批量重跑污染 `run_id` |
| **GEN-04 导入导出** | 导入场景 YAML / DEM CSV，导出指标与报告 | 现有制品与 schema | 文件 + 导入校验结果 | `scenario.load_scenario`、`dem_to_dict` `[现有]`；导入校验 `[新增]` | 格式符合 schema；版本号可用 | 未知字段静默丢弃；导入绕过门禁；版本冲突；CSV 丢失 `note`/`architecture_adjusted` |
| **GEN-05 空态与错误态** | 首次使用、无运行、缺产物、校验失败、权限拒绝、断线时的明确引导 | 状态与错误分类 | 无 | 错误映射 `[适配]` | 无 | 把 `ConfigError` 显示成“防御漏检”；错误不可读；空态诱导用户跳过门禁 |
| **GEN-06 实时刷新与断线恢复** | 运行页自动刷新；断线重连补齐事件；多标签页不冲突 | 事件游标、运行状态 | 客户端游标（本地） | 轮询 `[适配]`；SSE/WS `[新增]` | 运行中或刚结束 | 丢事件必须全量重拉并提示；轮询造成重复事件需去重；多标签页写冲突 |
| **GEN-07 搜索与筛选** | 跨活动/运行/事件检索，保存筛选视图 | 索引、事件字段 | 用户视图偏好 | 客户端筛选 `[适配]`；服务端索引 `[新增]` | 数据量超过客户端阈值 | 索引延迟；跨租户泄漏；筛选项与后端字段不一致 |
| **GEN-08 通知** | 运行完成、探针失败、待评审、签字提醒 | 事件总线、待办 | 通知偏好 | `[新增]` | 已配置通知渠道 | 重复通知；通知风暴；把“运行完成”误当“结论已通过” |

---

## 3. 关键跨域流程

### 3.1 活动状态机

```text
draft ──提交评审──> pending_review ──批准──> approved ──入队──> queued
  ↑                     │                    │                    │
  └──── 退回修改 ────────┘                    │                    ↓
  │                                          │                 running
  └────────── 输入变更，自动退回草稿 ──────────┘                    │
                                                                  ↓
                                                              completed
任意非终态 ──作废(需理由)──> void
```

规则：

- `draft` 可编辑；`pending_review` 只可撤回；`approved` 起输入冻结，任何改动自动退回 `draft` 并作废旧批准。
- `queued/running` 不允许编辑场景、DEM、基线；只能终止。
- `completed` 不可改；异议走 EVD-04 / RPT-06，不修改原记录。
- 作者不能批准自己的活动；审批动作必须写审计。

### 3.2 门禁链（任一级失败则中止）

| 级别 | 检查 | 失败后的界面行为 |
|---|---|---|
| G1 语法/结构 | `validate_scenario`：技术、step_id、依赖、objective 证据 | 错误列表 + 定位；禁止保存为可运行版本 |
| G2 DEM 完整性 | `validate_dem`：每步有 MUST/SHOULD；负对照合法；无 tap+MUST_BLOCK | 矩阵高亮；禁止运行 |
| G3 阳性探针 | 每个 MUST 单元格“看得见” | 失败格标 I；阻断运行（当前仅系统级探针，需标注粒度不足） |
| G4 隔离/时钟 | egress 允许列表、sink 在线、时钟偏差 ≤10 ms | 阻断运行，提示环境故障，不得记为防御失效 |
| G5 运行 | 活动已批准、队列可用、`run_dir` 不冲突 | 拒绝启动并说明原因 |
| G6 证据完整 | 关键步证据齐全、hash 校验通过 | 缺证据步标 I；报告标“不可签字” |
| G7 评分 | 每个 `S`/`D3` 有证据引用 | 评分卡红标；禁止签字 |
| G8 签字 | 证据完整、I 比例达标、默认值已确认 | 降级为“观察报告”或拒绝发布 |

### 3.3 复核与覆盖链

```text
I 不可判定 ──> 复核：接受 I / 请求重跑 / 标环境缺陷
S/P1/P2/D1/D2/D3 ──异议(附证据)──> reviewer 初审 ──> approver 批准
                                                     └──> 覆盖记录（原值保留）
                                                            └──> 指标重算（需新版本）
```

约束：

- 覆盖只能“新增解释层”，不能删除原判定；所有视图同时显示原值与覆盖值。
- 提出人与审批人必须不同；覆盖必须引用证据 ID。
- 覆盖后指标与报告必须重算并产生新版本，不能沿用旧 hash。

### 3.4 回放与对比

- 回放依赖 `manifest.json` 的场景 hash、配置 hash、种子与决策序列；不依赖重跑 LLM。
- 同一 `scenario_id` 且 `scenario_sha256`、`config_sha256`、`seeds` 一致才允许直接对比；否则标“不可比”。
- 单次运行只作案例；重复 ≥5 次才允许展示比例类结论，且需 Wilson 区间（当前未实现，UI 需标注）。

---

## 4. 哪些功能不放在 UI

| 功能 | 放在哪里 | 为什么不放 UI |
|---|---|---|
| 判据算法本体（E/R/O、六态阈值、最小失效集计算） | `judge.py`、`attribution.py`、代码仓库 | 判据必须确定性、可审计；界面可改就等于“边跑边改评分标准”，结论不可信 |
| 日志归一化与关联分组 | `siem.py`（模拟）/ 独立 SIEM 部署 | 裁判侧独立性要求；UI 不应参与“把告警变成事件”的裁决 |
| 技术 → 防御系统映射表、DEM 自动生成规则 | `configs/techniques.yaml`，走代码评审 | 属于基线知识，改动会影响所有场景；必须在版本评审中冻结，不能由单人在界面里改 |
| 指标公式、分母与排除规则 | `metrics.py` | 口径即结论；界面只展示定义，不提供“自定义分母” |
| 攻击载荷、变体构造、规避决策 | 攻击执行面（隔离靶场） | 安全边界；控制台最多展示脱敏后的决策摘要 |
| 执行器实现与隔离守卫策略 | 执行集群 / IaC | 属基础设施配置；改错会突破靶场边界，不能由业务界面操作 |
| 证据原始存储、WORM、哈希链 | 证据库 | 存储层职责；UI 只读校验结果 |
| 时钟同步、NTP/PTP 配置 | 基础设施 | 属环境运维；UI 只展示偏差是否达标 |
| 凭据、证书、密钥 | 密钥管理系统 | 不得进入业务界面与报告 |
| 原始 LLM prompt / 完整决策上下文 | 受限审计库 | 可能含敏感策略信息；按权限脱敏展示 |

---

## 5. 分级表

分级口径：**MVP 必备** = 没有它就无法完成一次可审计的测试闭环；**二期** = 提升效率/治理深度；**可延后** = 依赖外部系统或收益低于成本。

| ID | 功能 | 级别 | 理由 |
|---|---|---|---|
| ACT-01 | 创建活动 | MVP | 一切输入与产出的容器 |
| ACT-02 | 选择防御基线快照 | MVP | 结论必须绑定版本快照 |
| ACT-03 | 复制历史活动 | 二期 | 提效，但不影响闭环 |
| ACT-04 | 活动状态流转 | MVP | 防止“边改边跑”，也是签字前提 |
| ACT-05 | 活动列表/检索 | MVP | 没有列表无法进入任何活动；对比部分可延后 |
| SCN-01 | YAML/表单双模式 | MVP | 场景是核心输入 |
| SCN-02 | 步骤增删排序 | MVP | 编排的最小操作集 |
| SCN-03 | 技术选择 | MVP | 技术决定 tactic、类别与 DEM |
| SCN-04 | 期望拦截点/证据绑定 | 二期 | 可由 DEM 推导 + YAML 直接编辑过渡 |
| SCN-05 | 依赖图与环检测 | MVP | 环会导致运行失败，必须前置 |
| SCN-06 | 校验与错误定位 | MVP | 没有定位就无法修场景 |
| SCN-07 | 负对照编辑 | 二期 | MVP 可先用模板内置负对照 |
| DEM-01 | 矩阵总览 | MVP | 评审与门禁的主视图 |
| DEM-02 | 单元格编辑 | 二期 | 当前是编译产物；需先补 override 存储，否则会误导 |
| DEM-03 | tap 折算提示 | MVP | 防止把架构约束当产品缺陷 |
| DEM-04 | 完整性门禁 | MVP | 防止漏测被写成逃逸 |
| DEM-05 | DEM 版本与差异 | 二期 | 依赖评审流成熟 |
| RUN-01 | 启动运行 | MVP | 核心动作 |
| RUN-02 | 暂停/停止/回滚 | 二期 | 后端无中断点与复位能力 |
| RUN-03 | 实时进度 | 二期 | 当前同步执行、结束才落盘；MVP 先用“执行中”占位 |
| RUN-04 | 智能体协作视图 | MVP | 解释“为什么走这条链”的主要视图 |
| RUN-05 | 防御告警流 | MVP | 判据与评审的核心证据入口 |
| RUN-06 | 异常/中断处置 | 二期 | 需错误分类与复位能力 |
| RUN-07 | 原始事件查看 | MVP | 复核与取证的必需能力 |
| RUN-08 | 运行队列 | 二期 | 单用户实验可先串行 |
| EVD-01 | E/R/O 三层视图 | MVP | 判据透明度 |
| EVD-02 | 证据强度标注 | 二期 | 后端已有分级，先展示常量即可 |
| EVD-03 | 不可判定复核 | MVP | I 态必须能解释，否则指标失真 |
| EVD-04 | 结论异议与覆盖审计 | 二期 | 治理深度；MVP 先只读 + 复核记录 |
| EVD-05 | 证据完整性/哈希校验 | MVP | manifest 已有，成本低、收益高 |
| ATT-01 | 最小失效集 | MVP | 归因是平台核心价值 |
| ATT-02 | 单系统下钻 | MVP | 回答“某防御系统行不行” |
| ATT-03 | 指标口径说明 | MVP | 防止评审误读分母 |
| ATT-04 | 跨活动对比 | 二期 | 需多运行与可比性判断 |
| ATT-05 | 根因合并 | 二期 | 依赖归因分类字典 |
| RPT-01 | 三张评分卡 | MVP | 平台的最终产出 |
| RPT-02 | 报告预览 | MVP | 结论可读 |
| RPT-03 | 导出 Markdown/JSON/CSV | MVP | 交付物；PDF 可延后 |
| RPT-04 | 报告版本留痕 | MVP | 可复现与签字前提 |
| RPT-05 | 历史报告对比 | 二期 | 依赖稳定版本管理 |
| RPT-06 | 发布与签字 | 二期 | 治理能力，MVP 可用“内部评审”替代 |
| ENV-01 | 拓扑查看 | 二期 | 当前无 topology 模型，需先补数据 |
| ENV-02 | 防御基线编辑 | MVP | 决定 DEM 与判据 |
| ENV-03 | 阳性探针门禁 | MVP | 没有它“零告警”不可信 |
| ENV-04 | 环境健康检查 | 二期 | 依赖靶场与 SIEM 接口 |
| ENV-05 | 三级复位 | 二期 | MVP 未实现，且依赖执行集群 |
| GEN-01 | 权限与角色 | MVP | 至少区分“编辑/复核/只读”，否则无法多人评审 |
| GEN-02 | 操作审计 | MVP | 签字与复核的前提 |
| GEN-03 | 批量操作 | 可延后 | 单场景实验收益低 |
| GEN-04 | 导入导出 | 二期 | 场景 YAML 可直接编辑过渡；CSV 导入风险高 |
| GEN-05 | 空态与错误态 | MVP | 直接影响可用性与误判 |
| GEN-06 | 实时刷新/断线恢复 | 二期 | 与 RUN-03 同步建设 |
| GEN-07 | 搜索与筛选 | 二期 | 数据量小时客户端筛选足够 |
| GEN-08 | 通知 | 可延后 | 非闭环必需 |

---

## 6. 相对建议清单的增删说明

**新增**（原建议未列，但闭环需要）：

- `ACT-05` 活动列表：没有入口就无法进入活动；原“活动管理”只写了创建与流转。
- `EVD-05` 证据完整性/哈希校验：`manifest.json` 已有 hash，属于低成本高收益的可信度能力。
- `RPT-04/06` 版本留痕与签字：原建议只写“版本留痕”，但签字是“结论生效”的必要动作。
- `RUN-08` 运行队列、`GEN-07` 搜索、`GEN-08` 通知：运行与运维的实际操作面。
- `ATT-05` 根因合并：设计 5.5 明确要求平台级根因单列，原建议只写了“最小失效集”。

**合并/调整**：

- “选择防御基线”放在 `ACT-02`，“逐系统参数编辑”放在 `ENV-02`，避免两个写入口。
- “部署模式设置”归入 `ENV-02`，“tap 折算提示”单列 `DEM-03`，因为后者是门禁语义，不只是表单提示。
- “运行与监控”拆成 `RUN`（活动视角）与 `ENV`（环境视角），因为二者的权限与失败处置完全不同。
- “回滚”从运行监控拆到 `RUN-02` 与 `ENV-05`：前者是任务控制，后者是环境复位，不能混为一个按钮。

**明确取舍**：

- **B2 不在 MVP UI 开放创建**：`scenario.py` 的 `BUSINESS_CLASSES` 支持 B2，但 `cli.py` 只提供 B1/B3 模板，且没有 B2 demo 场景。UI 必须显示“B2 规划中”，否则用户会创建出一个没有模板、没有基线、无法判分的活动。
- **拓扑查看降级为二期**：MVP 场景没有 `topology` 字段；强行画图会制造“权威拓扑”的错觉。MVP 只展示由 `steps.asset` 与 `defense_baseline.face` 推导的资产/部署面视图，并标注“推导视图”。
- **DEM 单元格直接编辑降级为二期**：`dem.resolved.yaml` 是编译产物，直接编辑会在重算时丢失。MVP 只允许改基线/映射，或把 override 作为新增能力后再开放。

---

## 7. 要让这份清单落地，后端需补的最小能力

| 序号 | 能力 | 影响的 UI 功能 | 说明 |
|---|---|---|---|
| 1 | 活动存储与状态机 | ACT-01/03/04/05 | 现有只有 `runs/` 目录，没有“活动”对象 |
| 2 | 认证与 RBAC | GEN-01、EVD-04、RPT-06 | 至少 viewer/author/reviewer/approver |
| 3 | 追加式审计 | GEN-02、ACT-04、EVD-04 | 所有写操作需 actor/reason/前后值 |
| 4 | 运行队列与进度事件流 | RUN-01/03/06/08、GEN-06 | 当前 `execute_run` 同步、结束才落盘 |
| 5 | 复核/覆盖层 | EVD-03/04 | 判据不可变，覆盖需独立存储与重算 |
| 6 | DEM override 存储 | DEM-02 | 否则“编辑单元格”无法持久 |
| 7 | 校验行号映射 | SCN-01/06 | `ConfigError` 目前是纯文本 |
| 8 | 拓扑模型 | ENV-01 | 设计有 `topology.ref`，MVP 未实现 |
| 9 | 单元格级阳性探针 | ENV-03 | 当前只有系统级 `probe` |
| 10 | 三级复位 | RUN-02、ENV-05 | 设计 4.6，MVP 未实现 |
| 11 | 跨活动对比/报告 diff | ATT-04、RPT-05 | 现有 JSON 可做客户端版，正式版需服务端 |
| 12 | PDF 导出与脱敏 | RPT-03 | Markdown/JSON 已可用 |

---

## 8. 一页结论

- UI 的第一职责不是“跑攻击”，而是**把输入做成可校验、可冻结、可审计的制品**，再把后端判定**原样可解释地展示出来**。
- 任何“改结论”的入口都必须走复核/覆盖审计，且原值不可丢；任何“改输入”的入口都必须触发门禁与版本回退。
- MVP 先做只读结论 + 场景/DEM 编辑 + 运行与告警观察 + 报告导出；实时进度、覆盖审计、拓扑、复位、PDF 放到二期。
- 当前后端已经支撑 60% 以上的“读”能力；真正要补的是**活动/权限/审计/队列/复核**这五类平台能力。
