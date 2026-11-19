import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CIIO_G6_SANDBOX_TOPOLOGIES,
  getG6SandboxTopologyByUnit,
  SANDBOX_COMBOS,
  SANDBOX_NODES,
  SANDBOX_EDGES,
  ESCAPE_STAGE_TIMELINE,
} from './g6SandboxTopologyData';

test('default exports remain valid and compatible with 3-tier 4-combo architecture', () => {
  assert.equal(SANDBOX_COMBOS.length, 4);
  const assetNodes = SANDBOX_NODES.filter((n) => n.boundaryLayer === 'tier3-asset');
  assert.equal(assetNodes.length, 20);
  assert.ok(SANDBOX_EDGES.length >= 20);
  assert.ok(ESCAPE_STAGE_TIMELINE[1]);
  assert.ok(ESCAPE_STAGE_TIMELINE[2]);
  assert.ok(ESCAPE_STAGE_TIMELINE[3]);
});

test('all 10 CIIO units (01 ~ 10) have distinct, self-consistent G6 topologies and valid 3-stage escape paths', () => {
  const unitIds = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
  const rootNodeIds = new Set<string>();
  const targetNodeIds = new Set<string>();
  const architectureTags = new Set<string>();

  for (const id of unitIds) {
    const bundle = getG6SandboxTopologyByUnit(id);
    assert.equal(bundle.unitId, id, `Bundle unitId should match ${id}`);
    assert.ok(CIIO_G6_SANDBOX_TOPOLOGIES[id], `Topology dictionary must include unit ${id}`);

    // 4 security zone combos per unit
    assert.equal(bundle.combos.length, 4, `Unit ${id} must have 4 security zone combos`);

    // Tier 1 root (1), Tier 1 boundary (3 or 4), Tier 2 isolation (2 or 3), Tier 3 assets (20)
    const rootNodes = bundle.nodes.filter((n) => n.boundaryLayer === 'tier1-root');
    const boundaryNodes = bundle.nodes.filter((n) => n.boundaryLayer === 'tier1-boundary');
    const isolationNodes = bundle.nodes.filter((n) => n.boundaryLayer === 'tier2-isolation');
    const assetNodes = bundle.nodes.filter((n) => n.boundaryLayer === 'tier3-asset');

    assert.equal(rootNodes.length, 1, `Unit ${id} must have 1 root router`);
    assert.ok(
      boundaryNodes.length >= 3 && boundaryNodes.length <= 4,
      `Unit ${id} must have 3~4 boundary defense nodes`
    );
    assert.ok(
      isolationNodes.length >= 2 && isolationNodes.length <= 3,
      `Unit ${id} must have 2~3 inter-zone isolation/detection nodes`
    );
    assert.equal(assetNodes.length, 20, `Unit ${id} must have 20 bottom asset nodes`);

    rootNodeIds.add(rootNodes[0].id);
    targetNodeIds.add(bundle.escapeConfig.stage3CompromisedNodeId);
    architectureTags.add(bundle.architectureTag);

    // Every edge must reference valid nodes in this unit
    const nodeIds = new Set(bundle.nodes.map((n) => n.id));
    for (const edge of bundle.edges) {
      assert.ok(
        nodeIds.has(edge.source),
        `Unit ${id} edge ${edge.id} has invalid source ${edge.source}`
      );
      assert.ok(
        nodeIds.has(edge.target),
        `Unit ${id} edge ${edge.id} has invalid target ${edge.target}`
      );
    }

    // Escape config edges & nodes must exist in this unit
    const edgeIds = new Set(bundle.edges.map((e) => e.id));
    assert.ok(
      edgeIds.has(bundle.escapeConfig.stage1EdgeId),
      `Unit ${id} stage1EdgeId must exist`
    );
    assert.ok(
      nodeIds.has(bundle.escapeConfig.stage1InterceptNodeId),
      `Unit ${id} stage1InterceptNodeId must exist`
    );
    for (const bEdge of bundle.escapeConfig.stage2BlockedEdgeIds) {
      assert.ok(edgeIds.has(bEdge), `Unit ${id} stage2BlockedEdgeId ${bEdge} must exist`);
    }
    assert.ok(
      edgeIds.has(bundle.escapeConfig.stage2BypassEdgeId),
      `Unit ${id} stage2BypassEdgeId must exist`
    );
    for (const sEdge of bundle.escapeConfig.stage3StrikeEdgeIds) {
      assert.ok(edgeIds.has(sEdge), `Unit ${id} stage3StrikeEdgeId ${sEdge} must exist`);
    }
    assert.ok(
      nodeIds.has(bundle.escapeConfig.stage3CompromisedNodeId),
      `Unit ${id} stage3CompromisedNodeId must exist`
    );
  }

  // Ensure all 10 units have unique root nodes and unique core target nodes
  assert.equal(rootNodeIds.size, 10, 'All 10 CIIO units must have distinct root router IDs');
  assert.equal(
    targetNodeIds.size,
    10,
    'All 10 CIIO units must have distinct core target node IDs'
  );
  assert.equal(
    architectureTags.size,
    10,
    'All 10 CIIO units must have distinct architecture tags'
  );
});
