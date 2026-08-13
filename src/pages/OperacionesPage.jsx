import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const defaultForm = {
  fechaHora: '',
  sesion: '',
  par: '',
  liquidez: 'imbalance',
  liquidezEnSesion: true,
  liquidaUltimaVela4h: false,
  timeframeLiquidez: '',
  quiebreTendenciaEntrada: true,
  timeframeImbalanceEntrada: '',
  descripcion: '',
  pipsStopLoss: '',
  pipsProfit: '',
  riesgoPorcentaje: '',
  profitPorcentaje: '',
  reliquida: false,
  pipsReliquidacion: '',
  ajusteStopLossPips: '',
  objetivoPrecio: 'imbalance',
  timeframeObjetivo: '',
  alcanzaTarget: '',
  pipsObjetivo: '',
  porcentajeObjetivo: '',
  resultadoOperacion: '',
  operacionTomada: false,
  imagenUrl: ''
};

function OperacionesPage() {
  const navigate = useNavigate();
  const [operaciones, setOperaciones] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [pares, setPares] = useState([]);
  const [timeframes, setTimeframes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    sesion: '',
    par: '',
    liquidez: '',
    liquidezEnSesion: '',
    liquidaUltimaVela4h: '',
    timeframeLiquidez: '',
    quiebreTendenciaEntrada: '',
    timeframeImbalanceEntrada: '',
    reliquida: '',
    objetivoPrecio: '',
    timeframeObjetivo: '',
    alcanzaTarget: '',
    operacionTomada: '',
    resultadoOperacion: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [opsRes, sesionesRes, paresRes, timeframesRes] = await Promise.all([
        api.get('/operaciones'),
        api.get('/sesiones'),
        api.get('/pares'),
        api.get('/timeframes')
      ]);
      setOperaciones(opsRes.data);
      setSesiones(sesionesRes.data);
      setPares(paresRes.data);
      setTimeframes(timeframesRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      handleOpenForm();
      const params = new URLSearchParams(searchParams);
      params.delete('new');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let imageUrl = form.imagenUrl;
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          const uploadRes = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          imageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          imageUrl = '';
        }
      }

      const payload = { ...form, imagenUrl: imageUrl, operacionTomada: Boolean(form.operacionTomada), liquidaUltimaVela4h: Boolean(form.liquidaUltimaVela4h), alcanzaTarget: form.alcanzaTarget === '' ? null : form.alcanzaTarget === 'true', pipsStopLoss: Number(form.pipsStopLoss), pipsProfit: Number(form.pipsProfit), riesgoPorcentaje: Number(form.riesgoPorcentaje), profitPorcentaje: Number(form.profitPorcentaje), pipsReliquidacion: Number(form.pipsReliquidacion), ajusteStopLossPips: Number(form.ajusteStopLossPips), pipsObjetivo: Number(form.pipsObjetivo), porcentajeObjetivo: Number(form.porcentajeObjetivo) };
      if (editingId) {
        await api.put(`/operaciones/${editingId}`, payload);
      } else {
        await api.post('/operaciones', payload);
      }
      setForm(defaultForm);
      setEditingId(null);
      setShowForm(false);
      setImageFile(null);
      await fetchData();
    } catch (err) {
      setError(editingId ? 'No se pudo actualizar la operación' : 'No se pudo crear la operación');
    }
  };

  const handleOpenForm = () => {
    setEditingId(null);
    setShowForm(true);
    setForm(defaultForm);
    setImageFile(null);
  };

  const handleCloseForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm(defaultForm);
    setImageFile(null);
  };

  const handleEdit = (op) => {
    setEditingId(op._id);
    setShowForm(true);
    const toBogotaInput = (dateStr) => {
      if (!dateStr) return '';
      const bogota = new Date(dateStr).toLocaleString('sv-SE', { timeZone: 'America/Bogota', hour12: false });
      return bogota.replace(' ', 'T').slice(0, 16);
    };

    setForm({
      fechaHora: op.fechaHora ? toBogotaInput(op.fechaHora) : '',
      sesion: op.sesion?._id || op.sesion || '',
      par: op.par?._id || op.par || '',
      liquidez: op.liquidez || 'imbalance',
      liquidezEnSesion: Boolean(op.liquidezEnSesion),
      liquidaUltimaVela4h: Boolean(op.liquidaUltimaVela4h),
      timeframeLiquidez: op.timeframeLiquidez?._id || op.timeframeLiquidez || '',
      quiebreTendenciaEntrada: Boolean(op.quiebreTendenciaEntrada),
      timeframeImbalanceEntrada: op.timeframeImbalanceEntrada?._id || op.timeframeImbalanceEntrada || '',
      descripcion: op.descripcion || '',
      pipsStopLoss: op.pipsStopLoss || '',
      pipsProfit: op.pipsProfit || '',
      riesgoPorcentaje: op.riesgoPorcentaje || '',
      profitPorcentaje: op.profitPorcentaje || '',
      reliquida: Boolean(op.reliquida),
      pipsReliquidacion: op.pipsReliquidacion || '',
      ajusteStopLossPips: op.ajusteStopLossPips || '',
      objetivoPrecio: op.objetivoPrecio || 'imbalance',
      timeframeObjetivo: op.timeframeObjetivo?._id || op.timeframeObjetivo || '',
      alcanzaTarget: op.alcanzaTarget === undefined || op.alcanzaTarget === null ? '' : String(op.alcanzaTarget),
      pipsObjetivo: op.pipsObjetivo || '',
      porcentajeObjetivo: op.porcentajeObjetivo || '',
      resultadoOperacion: op.resultadoOperacion || '',
      operacionTomada: Boolean(op.operacionTomada),
      imagenUrl: op.imagenUrl || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta operación?')) return;
    try {
      await api.delete(`/operaciones/${id}`);
      await fetchData();
    } catch (err) {
      setError('No se pudo eliminar la operación');
    }
  };

  const filteredOperaciones = [...operaciones]
    .filter((op) => {
      const fechaOp = new Date(op.fechaHora);
      const desde = filters.fechaDesde ? new Date(filters.fechaDesde) : null;
      const hasta = filters.fechaHasta ? new Date(filters.fechaHasta) : null;

      if (desde && fechaOp < desde) return false;
      if (hasta) {
        const fechaHastaFin = new Date(hasta);
        fechaHastaFin.setHours(23, 59, 59, 999);
        if (fechaOp > fechaHastaFin) return false;
      }

      if (filters.sesion && String(op.sesion?._id || op.sesion) !== String(filters.sesion)) return false;
      if (filters.par && String(op.par?._id || op.par) !== String(filters.par)) return false;
      if (filters.liquidez && op.liquidez !== filters.liquidez) return false;
      if (filters.liquidezEnSesion !== '' && String(op.liquidezEnSesion) !== filters.liquidezEnSesion) return false;
      if (filters.liquidaUltimaVela4h !== '' && String(op.liquidaUltimaVela4h) !== filters.liquidaUltimaVela4h) return false;
      if (filters.timeframeLiquidez && String(op.timeframeLiquidez?._id || op.timeframeLiquidez) !== String(filters.timeframeLiquidez)) return false;
      if (filters.quiebreTendenciaEntrada !== '' && String(op.quiebreTendenciaEntrada) !== filters.quiebreTendenciaEntrada) return false;
      if (filters.timeframeImbalanceEntrada && String(op.timeframeImbalanceEntrada?._id || op.timeframeImbalanceEntrada) !== String(filters.timeframeImbalanceEntrada)) return false;
      if (filters.reliquida !== '' && String(op.reliquida) !== filters.reliquida) return false;
      if (filters.objetivoPrecio && op.objetivoPrecio !== filters.objetivoPrecio) return false;
      if (filters.timeframeObjetivo && String(op.timeframeObjetivo?._id || op.timeframeObjetivo) !== String(filters.timeframeObjetivo)) return false;
      if (filters.alcanzaTarget !== '') {
        if (filters.alcanzaTarget === 'sin-definir') {
          if (op.alcanzaTarget !== undefined && op.alcanzaTarget !== null) return false;
        } else if (String(op.alcanzaTarget) !== filters.alcanzaTarget) {
          return false;
        }
      }
      if (filters.operacionTomada !== '' && String(op.operacionTomada) !== filters.operacionTomada) return false;
      if (filters.resultadoOperacion && op.resultadoOperacion !== filters.resultadoOperacion) return false;

      return true;
    })
    .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

  const dashboardStats = filteredOperaciones.reduce(
    (acc, op) => {
      const profit = Number(op.profitPorcentaje) || 0;
      const risk = Number(op.riesgoPorcentaje) || 0;
      acc.totalOperaciones += 1;

      if (op.resultadoOperacion === 'ganada') {
        acc.ganadas += 1;
        acc.totalProfitsNetos += profit;
      } else if (op.resultadoOperacion === 'perdida') {
        acc.perdidas += 1;
        acc.totalProfitsNetos -= risk;
      } else if (op.resultadoOperacion === 'breakEven') {
        acc.breakEven += 1;
      }

      if (op.alcanzaTarget === true) {
        acc.objetivosAlcanzados += 1;
      }

      return acc;
    },
    { totalProfitsNetos: 0, totalOperaciones: 0, ganadas: 0, perdidas: 0, breakEven: 0, objetivosAlcanzados: 0 }
  );

  const porcentajeObjetivos = filteredOperaciones.reduce((acc, op) => {
    const objetivo = Number(op.porcentajeObjetivo) || 0;
    const riesgo = Number(op.riesgoPorcentaje) || 0;
    if (op.alcanzaTarget) {
      acc += objetivo;
    } else {
      acc -= riesgo;
    }
    return acc;
  }, 0);

  return (
    <div>
      {(showForm || editingId) && (
        <div className="modal-backdrop" onClick={handleCloseForm}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar operación' : 'Registrar operación'}</h2>
              <button type="button" className="secondary" onClick={handleCloseForm}>✕</button>
            </div>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="grid">
                <label>Fecha y hora<input name="fechaHora" type="datetime-local" value={form.fechaHora} onChange={handleChange} required /></label>
                <label>Sesión<select name="sesion" value={form.sesion} onChange={handleChange} required><option value="">Selecciona</option>{sesiones.map((s) => <option key={s._id} value={s._id}>{s.nombre}</option>)}</select></label>
                <label>Par<select name="par" value={form.par} onChange={handleChange} required><option value="">Selecciona</option>{pares.map((p) => <option key={p._id} value={p._id}>{p.nombre}</option>)}</select></label>
                <label>Liquidez<select name="liquidez" value={form.liquidez} onChange={handleChange}><option value="imbalance">Imbalance</option><option value="minimo">Mínimo</option><option value="maximo">Máximo</option></select></label>
                <label>Liquidez en sesión<input name="liquidezEnSesion" type="checkbox" checked={form.liquidezEnSesion} onChange={handleChange} /></label>
                <label>Liquida última vela 4h<input name="liquidaUltimaVela4h" type="checkbox" checked={form.liquidaUltimaVela4h} onChange={handleChange} /></label>
                <label>Timeframe liquidez<select name="timeframeLiquidez" value={form.timeframeLiquidez} onChange={handleChange} required><option value="">Selecciona</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
                <div className="filter-dual-group">
                  <label>Quiebre tendencia entrada<input name="quiebreTendenciaEntrada" type="checkbox" checked={form.quiebreTendenciaEntrada} onChange={handleChange} /></label>
                  <label>Timeframe imbalance entrada<select name="timeframeImbalanceEntrada" value={form.timeframeImbalanceEntrada} onChange={handleChange} required><option value="">Selecciona</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
                </div>
                <label>Descripción<textarea name="descripcion" value={form.descripcion} onChange={handleChange} required /></label>
                <label>Pips stop loss<input name="pipsStopLoss" type="number" step="0.1" value={form.pipsStopLoss} onChange={handleChange} required /></label>
                <label>Pips profit<input name="pipsProfit" type="number" step="0.1" value={form.pipsProfit} onChange={handleChange} required /></label>
                <label>Riesgo %<input name="riesgoPorcentaje" type="number" step="0.1" value={form.riesgoPorcentaje} onChange={handleChange} required /></label>
                <label>Profit %<input name="profitPorcentaje" type="number" step="0.1" value={form.profitPorcentaje} onChange={handleChange} required /></label>
                <label>Reliquida<input name="reliquida" type="checkbox" checked={form.reliquida} onChange={handleChange} /></label>
                <label>Pips reliquidación<input name="pipsReliquidacion" type="number" step="0.1" value={form.pipsReliquidacion} onChange={handleChange} /></label>
                <label>Ajuste stop loss pips<input name="ajusteStopLossPips" type="number" step="0.1" value={form.ajusteStopLossPips} onChange={handleChange} /></label>
                <label>Objetivo precio<select name="objetivoPrecio" value={form.objetivoPrecio} onChange={handleChange}><option value="imbalance">Imbalance</option><option value="minimo">Mínimo</option><option value="maximo">Máximo</option></select></label>
                <label>Timeframe objetivo<select name="timeframeObjetivo" value={form.timeframeObjetivo} onChange={handleChange} required><option value="">Selecciona</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
                <label>Alcanza objetivo<select name="alcanzaTarget" value={form.alcanzaTarget} onChange={handleChange}>
                  <option value="">Sin definir</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select></label>
                <label>Pips objetivo<input name="pipsObjetivo" type="number" step="0.1" value={form.pipsObjetivo} onChange={handleChange} required /></label>
                <label>Porcentaje objetivo<input name="porcentajeObjetivo" type="number" step="0.1" value={form.porcentajeObjetivo} onChange={handleChange} /></label>
                <label>Operación tomada<input name="operacionTomada" type="checkbox" checked={form.operacionTomada} onChange={handleChange} /></label>
                <label>Resultado operación<select name="resultadoOperacion" value={form.resultadoOperacion} onChange={handleChange}>
                  <option value="">Selecciona</option>
                  <option value="ganada">Ganada</option>
                  <option value="breakEven">Break Even</option>
                  <option value="perdida">Perdida</option>
                </select></label>
                <label>Imagen<input type="file" onChange={(e) => setImageFile(e.target.files[0])} /></label>
              </div>
              <div className="row" style={{ marginTop: '16px' }}>
                <button type="submit">{editingId ? 'Actualizar operación' : 'Guardar operación'}</button>
                <button type="button" className="secondary" onClick={handleCloseForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sticky-summary">
        <div className="panel">
          <h2 style={{ margin: '0 0 10px' }}>Dashboard</h2>
          <div className="dashboard-grid">
            <div className="metric-card">
              <h3>Profits netos</h3>
              <p>{dashboardStats.totalProfitsNetos.toFixed(2)}%</p>
            </div>
            <div className="metric-card">
              <h3>Ganadas</h3>
              <p>{dashboardStats.ganadas}</p>
            </div>
            <div className="metric-card">
              <h3>Perdidas</h3>
              <p>{dashboardStats.perdidas}</p>
            </div>
            <div className="metric-card">
              <h3>Break Even</h3>
              <p>{dashboardStats.breakEven}</p>
            </div>
            <div className="metric-card">
              <h3>Objetivos alcanzados</h3>
              <p>{dashboardStats.objetivosAlcanzados}</p>
            </div>
            <div className="metric-card">
              <h3>Porcentaje objetivos</h3>
              <p>{porcentajeObjetivos.toFixed(2)}%</p>
            </div>
            <div className="metric-card">
              <h3>Operaciones</h3>
              <p>{dashboardStats.totalOperaciones}</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 style={{ margin: '0 0 10px' }}>Filtros</h2>
          <div className="filter-grid">
            <label>Desde<input name="fechaDesde" type="date" value={filters.fechaDesde} onChange={handleFilterChange} /></label>
            <label>Hasta<input name="fechaHasta" type="date" value={filters.fechaHasta} onChange={handleFilterChange} /></label>
            <label>Sesión<select name="sesion" value={filters.sesion} onChange={handleFilterChange}><option value="">Todas</option>{sesiones.map((s) => <option key={s._id} value={s._id}>{s.nombre}</option>)}</select></label>
            <label>Par<select name="par" value={filters.par} onChange={handleFilterChange}><option value="">Todos</option>{pares.map((p) => <option key={p._id} value={p._id}>{p.nombre}</option>)}</select></label>
            <label>Liquidez<select name="liquidez" value={filters.liquidez} onChange={handleFilterChange}><option value="">Todas</option><option value="imbalance">Imbalance</option><option value="minimo">Mínimo</option><option value="maximo">Máximo</option></select></label>
            <label>Liquidez en sesión<select name="liquidezEnSesion" value={filters.liquidezEnSesion} onChange={handleFilterChange}><option value="">Todas</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Liquida última vela 4h<select name="liquidaUltimaVela4h" value={filters.liquidaUltimaVela4h} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Timeframe liquidez<select name="timeframeLiquidez" value={filters.timeframeLiquidez} onChange={handleFilterChange}><option value="">Todos</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
            <label>Quiebre tendencia entrada<select name="quiebreTendenciaEntrada" value={filters.quiebreTendenciaEntrada} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>TF imbalance entrada<select name="timeframeImbalanceEntrada" value={filters.timeframeImbalanceEntrada} onChange={handleFilterChange}><option value="">Todos</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
            <label>Reliquida<select name="reliquida" value={filters.reliquida} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Objetivo precio<select name="objetivoPrecio" value={filters.objetivoPrecio} onChange={handleFilterChange}><option value="">Todos</option><option value="imbalance">Imbalance</option><option value="minimo">Mínimo</option><option value="maximo">Máximo</option></select></label>
            <label>Timeframe objetivo<select name="timeframeObjetivo" value={filters.timeframeObjetivo} onChange={handleFilterChange}><option value="">Todos</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
            <label>Alcanza target<select name="alcanzaTarget" value={filters.alcanzaTarget} onChange={handleFilterChange}><option value="">Todas</option><option value="sin-definir">Sin definir</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Operación tomada<select name="operacionTomada" value={filters.operacionTomada} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Resultado operación<select name="resultadoOperacion" value={filters.resultadoOperacion} onChange={handleFilterChange}><option value="">Todos</option><option value="ganada">Ganada</option><option value="breakEven">Break Even</option><option value="perdida">Perdida</option></select></label>
          </div>
        </div>
        <div className="panel operations-panel">
          <h2 className="operations-title">Operaciones</h2>

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="operations-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Par</th>
                    <th>Sesión</th>
                    <th>Descripción</th>
                    <th>Resultado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOperaciones.map((op) => (
                    <tr key={op._id}>
                      <td>
                        {op.fechaHora
                          ? new Date(op.fechaHora).toLocaleString('es-CO', {
                              timeZone: 'America/Bogota'
                            })
                          : '—'}
                      </td>

                      <td>{op.par?.nombre || '—'}</td>

                      <td>{op.sesion?.nombre || '—'}</td>

                      <td>{op.descripcion}</td>

                      <td>
                        {op.resultadoOperacion === 'ganada' ? (
                          <span className="resultado-badge resultado-ganada">Ganada</span>
                        ) : op.resultadoOperacion === 'perdida' ? (
                          <span className="resultado-badge resultado-perdida">Perdida</span>
                        ) : op.resultadoOperacion === 'breakEven' ? (
                          <span className="resultado-badge resultado-break-even">Break Even</span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="actions-cell">
                        <div className="row">
                          <button onClick={() => navigate(`/operaciones/${op._id}`)}>
                            Ver
                          </button>

                          <button
                            className="secondary"
                            onClick={() => handleEdit(op)}
                          >
                            Editar
                          </button>

                          <button
                            className="danger"
                            onClick={() => handleDelete(op._id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default OperacionesPage;
