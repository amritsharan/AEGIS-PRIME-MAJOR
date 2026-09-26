from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorEstimator, StatevectorSampler

# Build a small quantum circuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

print(f"Depth: {qc.depth()}")

sampler = StatevectorSampler()
job = sampler.run([qc])
result = job.result()
pub_result = result[0]
counts = pub_result.data.meas.get_counts()

print(f"Measured States: {counts}")
