import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_CIIO_UNITS,
  CIIO_TOPOLOGY_BY_UNIT,
  getCiioUnitTopology,
} from './ciioUnitsTopologyData';

test('INITIAL_CIIO_UNITS contains all 10 designated CIIO units with valid GCJ-02 coordinates', () => {
  assert.equal(INITIAL_CIIO_UNITS.length, 10);
  const expectedIds = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
  assert.deepEqual(
    INITIAL_CIIO_UNITS.map((u) => u.id),
    expectedIds
  );

  for (const unit of INITIAL_CIIO_UNITS) {
    assert.equal(unit.lngLat.length, 2);
    assert.ok(unit.lngLat[0] > 100 && unit.lngLat[0] < 130, `Invalid lng for ${unit.id}`);
    assert.ok(unit.lngLat[1] > 18 && unit.lngLat[1] < 50, `Invalid lat for ${unit.id}`);
  }
});

test('Every CIIO unit (01~10) has its own specific 5-layer defense structure topology', () => {
  const requiredZones = ['external', 'dmz', 'mgmt', 'control', 'field'] as const;

  for (const unit of INITIAL_CIIO_UNITS) {
    const { unit: resolvedUnit, topology } = getCiioUnitTopology(unit.id);
    assert.equal(resolvedUnit.id, unit.id);
    assert.ok(CIIO_TOPOLOGY_BY_UNIT[unit.id], `Missing topology for unit ${unit.id}`);
    assert.ok(topology.nodes.length >= 10, `Unit ${unit.id} should have at least 10 assets across 5 layers`);
    assert.ok(topology.deployments.length >= 6, `Unit ${unit.id} should have defense deployments`);

    // Verify all 5 defense layers have assets for this specific CIIO unit
    for (const zone of requiredZones) {
      const zoneNodes = topology.nodes.filter((n) => n.zone_id === zone);
      assert.ok(
        zoneNodes.length >= 2,
        `Unit ${unit.id} (${unit.name}) must have at least 2 assets in zone ${zone}`
      );
    }
  }
});
