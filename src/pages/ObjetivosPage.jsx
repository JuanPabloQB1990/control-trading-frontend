import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function ObjetivosPage() {
  const [operaciones, setOperaciones] = useState([]);
  const [pares, setPares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    par: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opsRes, paresRes] = await Promise.all([
          api.get('/operaciones'),
          api.get('/pares')
        ]);
        setOperaciones(opsRes.data || []);
        setPares(paresRes.data || []);
      } catch (err) {
        setError('No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOperaciones = useMemo(() => {
    return operaciones.filter((op) => {
      const fecha = new Date(op.fechaHora);
      const desde = filters.fechaDesde ? new Date(filters.fechaDesde) : null;
      const hasta = filters.fechaHasta ? new Date(filters.fechaHasta) : null;

      if (desde && fecha < new Date(desde.getFullYear(), desde.getMonth(), desde.getDate())) return false;
      if (hasta) {
        const hastaFin = new Date(hasta);
        hastaFin.setHours(23, 59, 59, 999);
        if (fecha > hastaFin) return false;
      }

      if (filters.par && String(op.par?._id || op.par) !== String(filters.par)) return false;

      return true;
    });
  }, [operaciones, filters]);

  const chartData = useMemo(() => {
    const orderedOperaciones = [...filteredOperaciones].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    const buckets = Array.from({ length: 15 }, (_, index) => ({
      label: `${index + 1}%`,
      value: index + 1,
      count: 0,
      maxFailedStreak: 0
    }));

    const total = filteredOperaciones.length;
    let reached = 0;

    orderedOperaciones.forEach((op) => {
      const isReached = op.alcanzaTarget === true || op.resultadoOperacion === 'ganada';
      if (!isReached) return;

      const porcentajeActual = Number(op.porcentajeObjetivo);
      const porcentajeBase = Number.isFinite(porcentajeActual) ? porcentajeActual : 0;
      const porcentajeEfectivo = op.resultadoOperacion === 'ganada'
        ? Math.max(2, porcentajeBase)
        : porcentajeBase;

      if (!Number.isFinite(porcentajeEfectivo) || porcentajeEfectivo <= 0) return;

      const highestBucket = Math.min(15, Math.max(1, Math.floor(porcentajeEfectivo)));

      for (let bucketValue = 1; bucketValue <= highestBucket; bucketValue += 1) {
        if (bucketValue <= 15) {
          buckets[bucketValue - 1].count += 1;
        }
      }

      reached += 1;
    });

    buckets.forEach((bucket) => {
      let streak = 0;

      orderedOperaciones.forEach((op) => {
        const raw = op.porcentajeObjetivo;
        const porcentaje = Number.isFinite(Number(raw)) ? Number(raw) : null;
        const isMissedByFlag = op.alcanzaTarget === false;
        const isMissedByPercentage = op.alcanzaTarget === true && porcentaje !== null && porcentaje > 0 && porcentaje < bucket.value;

        const isReachedForBucket =
          bucket.value === 2
            ? op.resultadoOperacion === 'ganada'
            : !isMissedByFlag && !isMissedByPercentage;

        if (bucket.value === 2) {
          if (op.resultadoOperacion !== 'ganada' && (isMissedByFlag || (porcentaje !== null && porcentaje > 0 && porcentaje < 2))) {
            streak += 1;
            bucket.maxFailedStreak = Math.max(bucket.maxFailedStreak, streak);
          } else {
            streak = 0;
          }
          return;
        }

        if (isMissedByFlag || isMissedByPercentage) {
          streak += 1;
          bucket.maxFailedStreak = Math.max(bucket.maxFailedStreak, streak);
        } else {
          streak = 0;
        }
      });
    });

    const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

    return {
      total,
      reached,
      buckets: buckets.map((bucket) => ({
        ...bucket,
        percentageOfTotal: total ? (bucket.count / total) * 100 : 0,
        height: maxCount ? (bucket.count / maxCount) * 100 : 0
      }))
    };
  }, [filteredOperaciones]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Porcentaje objetivo alcanzado</h2>

      <div className="filter-grid" style={{ marginBottom: '18px' }}>
        <label>
          Desde
          <input name="fechaDesde" type="date" value={filters.fechaDesde} onChange={handleFilterChange} />
        </label>
        <label>
          Hasta
          <input name="fechaHasta" type="date" value={filters.fechaHasta} onChange={handleFilterChange} />
        </label>
        <label>
          Par
          <select name="par" value={filters.par} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {pares.map((par) => (
              <option key={par._id} value={par._id}>{par.nombre}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <p className="chart-summary">
            Operaciones con target alcanzado: <strong>{chartData.reached}</strong> de <strong>{chartData.total}</strong>
          </p>

          <div className="goal-chart" aria-label="Diagrama de barras del porcentaje objetivo">
            {chartData.buckets.map((bucket) => (
              <div className="goal-bar-group" key={bucket.value}>
                <div className="goal-bar-value">
                  <span>{bucket.count}</span>
                  <small>{bucket.percentageOfTotal.toFixed(1)}%</small>
                </div>

                <div className="goal-bar-track">
                  <div
                    className="goal-bar-fill"
                    style={{ height: `${bucket.height}%` }}
                    title={`${bucket.count} operaciones en ${bucket.label}; racha sin alcanzar: ${bucket.maxFailedStreak}`}
                  />
                </div>

                <div className="goal-bar-label">{bucket.label}</div>
                <div className="goal-bar-streak">Racha: {bucket.maxFailedStreak}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ObjetivosPage;
