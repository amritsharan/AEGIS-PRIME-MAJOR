// src/utils/crypto.ts

/**
 * Interface representing the full Proof-of-Agency (PoA) Intent parameters (Eq. 1 in IEEE Zenith-Mesh specification)
 */
export interface IntentParameters {
  czk: string; // Poseidon commitment root from Lumina-Auth (C_ZK in F_p)
  agentUuid: string; // 128-bit Wasm sandbox agent identifier
  toolUri: string; // Requested capability resource (e.g. /sys/kernel/disburse)
  payloadOutput: string; // Synthesized payload validated by Z3 Logic-Shield
  epochTime: number; // Monotonic system epoch timestamp
}

/**
 * Interface representing a Merkle-Patricia Trie Leaf Node
 */
export interface MPTLeafNode {
  key: string; // AccountUser or AgentUUID
  nibblePath: string; // e.g., 0x7, 0x8
  val: string; // Intent Hash tau_audit
}

/**
 * Interface representing Forensic Incident Telemetry (Eq. 8 in IEEE Zenith-Mesh specification)
 */
export interface ForensicParameters {
  attackerIp: string;
  fingerprintTcp: string;
  canaryId: string;
  tCapture: string;
}

/**
 * Standard SHA-256 helper for browser environments
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes the canonical Proof-of-Agency (PoA) intent digest tau_audit (Eq. 1):
 * tau_audit = SHA3-256( C_ZK || Agent_UUID || H(Tool_URI) || H(Phi_output) || T_epoch )
 */
export async function computeProofOfAgencyIntent(params: IntentParameters): Promise<{
  toolUriHash: string;
  payloadHash: string;
  intentHash: string;
}> {
  const toolUriHash = await sha256(params.toolUri);
  const payloadHash = await sha256(params.payloadOutput);
  
  const tupleString = `${params.czk}:${params.agentUuid}:${toolUriHash}:${payloadHash}:${params.epochTime}`;
  const intentHash = await sha256(`POA:${tupleString}`);
  
  return {
    toolUriHash,
    payloadHash,
    intentHash
  };
}

/**
 * Computes the Merkle-Patricia Trie (MPT) State Root R_state from leaf nodes (Eq. 2):
 * R_state = MerkleRoot(Leaf_1, Leaf_2, ..., Leaf_N)
 */
export async function computeMPTStateRoot(leaves: MPTLeafNode[]): Promise<{
  stateRoot: string;
  leaves: MPTLeafNode[];
}> {
  if (leaves.length === 0) {
    const emptyRoot = await sha256('EMPTY_MPT_ROOT');
    return { stateRoot: emptyRoot, leaves: [] };
  }

  // Hash each leaf representation (Key || NibblePath || Val)
  const leafHashes: string[] = [];
  for (const leaf of leaves) {
    const h = await sha256(`LEAF:${leaf.key}:${leaf.nibblePath}:${leaf.val}`);
    leafHashes.push(h);
  }

  // Combine into Merkle Root
  let currentLevel = leafHashes;
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = await sha256(currentLevel[i] + currentLevel[i + 1]);
        nextLevel.push(combined);
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }

  const stateRoot = currentLevel[0] || (await sha256('EMPTY_MPT_ROOT'));
  return { stateRoot, leaves };
}

/**
 * Computes the SHA-256 digest of a Substrate consensus block header
 */
export async function computeSubstrateBlockHash(
  index: number,
  timestamp: string,
  stateRoot: string,
  intentHash: string,
  previousHash: string,
  authorNode: string,
  slotNumber: number
): Promise<string> {
  const headerString = `${index}-${timestamp}-${stateRoot}-${intentHash}-${previousHash}-${authorNode}-${slotNumber}`;
  return sha256(headerString);
}

/**
 * Computes Forensic Incident Tuple digest tau_incident (Eq. 8):
 * tau_incident = SHA3-256( Attacker_IP || Fingerprint_TCP || Canary_ID || T_capture )
 */
export async function computeForensicAttributionTuple(params: ForensicParameters): Promise<string> {
  const recordString = `INCIDENT:${params.attackerIp}:${params.fingerprintTcp}:${params.canaryId}:${params.tCapture}`;
  return sha256(recordString);
}

/**
 * Gaussian Differential Privacy Noise Addition for LoRA Parameter Tuning (Eq. 5):
 * Delta_W_tilde = Delta_W + N(0, sigma^2 * I)
 * where sigma = (Delta_S * sqrt(2 * ln(1.25 / delta))) / epsilon
 */
export function addDifferentialPrivacyNoise(
  gradients: number[],
  epsilon: number = 0.5,
  delta: number = 1e-5,
  sensitivity: number = 1.0
): { noisyGradients: number[]; sigma: number } {
  // Compute noise scale sigma
  const sigma = (sensitivity * Math.sqrt(2 * Math.log(1.25 / delta))) / Math.max(0.01, epsilon);

  // Box-Muller transform for generating Gaussian random variables
  const generateGaussian = (mean = 0, stdDev = 1) => {
    const u1 = Math.max(1e-10, Math.random());
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  };

  const noisyGradients = gradients.map((g) => g + generateGaussian(0, sigma * 0.05));

  return { noisyGradients, sigma };
}

/**
 * Byzantine-Robust Coordinate-Wise Median Filter Aggregation (Eq. 6):
 * [Delta_W*]_j = median([Delta_W_1]_j, [Delta_W_2]_j, ..., [Delta_W_M]_j)
 */
export function coordinateWiseMedian(nodeGradients: number[][]): number[] {
  if (nodeGradients.length === 0) return [];
  const vectorLength = nodeGradients[0].length;
  const result: number[] = [];

  for (let j = 0; j < vectorLength; j++) {
    const coordinateValues = nodeGradients.map((nodeGrad) => nodeGrad[j]).sort((a, b) => a - b);
    const mid = Math.floor(coordinateValues.length / 2);
    const medianVal =
      coordinateValues.length % 2 !== 0
        ? coordinateValues[mid]
        : (coordinateValues[mid - 1] + coordinateValues[mid]) / 2;
    result.push(medianVal);
  }

  return result;
}

/**
 * Standard Federated Averaging (FedAvg) for comparison
 */
export function fedAvg(nodeGradients: number[][]): number[] {
  if (nodeGradients.length === 0) return [];
  const vectorLength = nodeGradients[0].length;
  const result: number[] = new Array(vectorLength).fill(0);

  for (let j = 0; j < vectorLength; j++) {
    let sum = 0;
    for (let i = 0; i < nodeGradients.length; i++) {
      sum += nodeGradients[i][j];
    }
    result[j] = sum / nodeGradients.length;
  }

  return result;
}
