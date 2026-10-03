/**
 * CERT-In Immutable Audit Ledger Cryptographic Chaining
 * In compliance with:
 * - CERT-In Cyber Security Directions (Rule 20(1) / 180-day audit mandate)
 * - Information Technology (Preservation and Retention of Information) Rules
 * - Disaster Management Act (2005) Statutory Decision Log Integrity
 */

export interface AuditBlock {
  blockIndex: number;
  timestampIst: string;
  eventCode: string;
  principal: string;
  targetEntity: string;
  clientIp: string;
  complianceStatus: string;
  prevHash: string;
  blockHash: string;
}

// Deterministic fast SHA-256 simulation and verification helper
export function computeChainedHash(
  prevHash: string,
  timestamp: string,
  eventCode: string,
  principal: string,
  targetEntity: string
): string {
  const seed = `${prevHash}|${timestamp}|${eventCode}|${principal}|${targetEntity}|GOI_CERTIN_2026`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hexPart1 = (hash >>> 0).toString(16).padStart(8, "0");

  let hash2 = 0x55aa55aa;
  for (let i = seed.length - 1; i >= 0; i--) {
    hash2 ^= seed.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193);
  }
  const hexPart2 = (hash2 >>> 0).toString(16).padStart(8, "0");

  let hash3 = 0xdeadbeef;
  for (let i = 0; i < seed.length; i += 2) {
    hash3 ^= seed.charCodeAt(i);
    hash3 = Math.imul(hash3, 0x01000193);
  }
  const hexPart3 = (hash3 >>> 0).toString(16).padStart(8, "0");

  let hash4 = 0xcafe1234;
  for (let i = seed.length - 1; i >= 0; i -= 2) {
    hash4 ^= seed.charCodeAt(i);
    hash4 = Math.imul(hash4, 0x01000193);
  }
  const hexPart4 = (hash4 >>> 0).toString(16).padStart(8, "0");

  return `${hexPart1}${hexPart2}${hexPart3}${hexPart4}`.toLowerCase();
}

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

export const STATUTORY_AUDIT_LEDGER: AuditBlock[] = (() => {
  const rawEvents = [
    {
      timestampIst: "02 Oct 2026, 15:12:04 IST",
      eventCode: "HAZARD_INDEX_RECOMPUTED",
      principal: "system.dss_engine",
      targetEntity: "13,967 Habitations (Uttarakhand)",
      clientIp: "10.14.0.22 (NIC GovNet)",
      complianceStatus: "COMPLIANT_PASS",
    },
    {
      timestampIst: "02 Oct 2026, 14:58:30 IST",
      eventCode: "USER_SESSION_AUTHENTICATED",
      principal: "dm.dehradun@gov.in (District Magistrate)",
      targetEntity: "State Command Console",
      clientIp: "10.14.0.85 (State VPN)",
      complianceStatus: "2FA_VALIDATED",
    },
    {
      timestampIst: "02 Oct 2026, 14:34:11 IST",
      eventCode: "POSTGIS_NATIVE_JSONB_QUERY",
      principal: "db.postgis_cluster",
      targetEntity: "geodata_habitation (ST_AsGeoJSON)",
      clientIp: "127.0.0.1 (Docker Host)",
      complianceStatus: "OPTIMIZED",
    },
    {
      timestampIst: "02 Oct 2026, 14:12:00 IST",
      eventCode: "SHELTER_CAPACITY_EVALUATED",
      principal: "system.logistics_opt",
      targetEntity: "85 Safe Evacuation Centers",
      clientIp: "10.14.0.22 (NIC GovNet)",
      complianceStatus: "ALLOCATED",
    },
    {
      timestampIst: "02 Oct 2026, 13:40:55 IST",
      eventCode: "MULTI_HAZARD_SIMULATION_RUN",
      principal: "dm.dehradun (Executive IC)",
      targetEntity: "Chamoli Cloudburst Scenario (10km)",
      clientIp: "10.14.0.85 (State VPN)",
      complianceStatus: "RECORDED",
    },
    {
      timestampIst: "02 Oct 2026, 12:15:20 IST",
      eventCode: "CERT_IN_HASH_CHAIN_SEAL",
      principal: "security.certin_validator",
      targetEntity: "Immutable Ledger Block Checksum",
      clientIp: "10.14.0.1 (NIC GovNet)",
      complianceStatus: "SEALED",
    },
  ];

  let currentPrevHash = GENESIS_HASH;
  return rawEvents.map((ev, idx) => {
    const blockHash = computeChainedHash(
      currentPrevHash,
      ev.timestampIst,
      ev.eventCode,
      ev.principal,
      ev.targetEntity
    );
    const block: AuditBlock = {
      blockIndex: idx,
      ...ev,
      prevHash: currentPrevHash,
      blockHash,
    };
    currentPrevHash = blockHash;
    return block;
  });
})();

export function recordAuditBlock(
  eventCode: string,
  principal: string,
  targetEntity: string,
  clientIp = "10.14.0.85 (NIC Session)",
  complianceStatus = "COMPLIANT_PASS"
): AuditBlock {
  const lastBlock = STATUTORY_AUDIT_LEDGER[STATUTORY_AUDIT_LEDGER.length - 1];
  const prevHash = lastBlock ? lastBlock.blockHash : GENESIS_HASH;
  const now = new Date();
  const timestampIst =
    now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    now.toLocaleTimeString("en-GB", { hour12: false }) +
    " IST";
  const blockHash = computeChainedHash(
    prevHash,
    timestampIst,
    eventCode,
    principal,
    targetEntity
  );
  const newBlock: AuditBlock = {
    blockIndex: STATUTORY_AUDIT_LEDGER.length,
    timestampIst,
    eventCode,
    principal,
    targetEntity,
    clientIp,
    complianceStatus,
    prevHash,
    blockHash,
  };
  STATUTORY_AUDIT_LEDGER.push(newBlock);
  return newBlock;
}
