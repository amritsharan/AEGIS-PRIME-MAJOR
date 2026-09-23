"""
Zenith-Mesh HyperSpace P2P Federated Learning Consensus Subsystem
Part of Aegis-Prime Sovereign Intelligence Mesh — Layer 4.

Implements Byzantine-tolerant coordinate-wise median aggregation over P2P gradient topics.
"""

from __future__ import annotations

import statistics
from typing import Any, Dict, List, Optional


class HyperSpaceFederatedLearning:
    """
    HyperSpace P2P Federated Learning gradient consensus engine.
    Ensures that Byzantine adversarial nodes or corrupted gradient updates
    cannot poison the global sovereign model weights.
    """

    TOPIC: str = "/aegis/fl/lora/70b"

    def __init__(self, topic: Optional[str] = None) -> None:
        self.topic: str = topic or self.TOPIC
        self.aggregation_rounds: int = 0

    def coordinate_median_aggregation(self, gradients: List[List[float]]) -> List[float]:
        """
        Computes Byzantine-tolerant coordinate-wise median across gradient vectors.

        Given M client gradient vectors each of dimension D:
          Aggregated_coord[d] = Median({ gradients[m][d] for m in 1..M })

        Guarantees optimal breakdown point up to 50% Byzantine malicious actors.
        """
        if not gradients:
            return []

        # Validate dimensional consistency across all client gradients
        dim: int = len(gradients[0])
        for idx, g in enumerate(gradients):
            if len(g) != dim:
                raise ValueError(
                    f"Dimension mismatch in client gradient vector at index {idx}: "
                    f"expected dimension {dim}, but got {len(g)}."
                )

        if len(gradients) == 1:
            return list(gradients[0])

        aggregated_gradient: List[float] = []
        for d in range(dim):
            coordinate_values = [gradients[m][d] for m in range(len(gradients))]
            # Coordinate-wise median computation
            median_val = float(statistics.median(coordinate_values))
            aggregated_gradient.append(round(median_val, 8))

        self.aggregation_rounds += 1
        return aggregated_gradient

    def get_fl_telemetry(self) -> Dict[str, Any]:
        """Telemetry regarding federated learning rounds and topic subscription."""
        return {
            "topic": self.topic,
            "aggregation_strategy": "COORDINATE_WISE_MEDIAN_BYZANTINE_FAULT_TOLERANT",
            "aggregation_rounds_completed": self.aggregation_rounds,
            "consensus_status": "ACTIVE_P2P_MESH",
        }


# Global default instance
default_hyperspace_fl = HyperSpaceFederatedLearning()
