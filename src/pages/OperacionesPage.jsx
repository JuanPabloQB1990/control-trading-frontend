import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const defaultForm = {
  fechaHora: '',
  sesion: '',
  par: '',
  liquidez: 'imbalance',
  liquidezEnSesion: true,
  timeframeLiquidez: '',
  quiebreTendenciaEntrada: true,
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
  alcanzaTarget: false,
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
    timeframeLiquidez: '',
    quiebreTendenciaEntrada: '',
    reliquida: '',
    objetivoPrecio: '',
    timeframeObjetivo: '',
    alcanzaTarget: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [opsRes, sesionesRes, paresRes, timeframesRes] = await Promise.all([
        axios.get('/api/operaciones'),
        axios.get('/api/sesiones'),
        axios.get('/api/pares'),
        axios.get('/api/timeframes')
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
          const uploadRes = await axios.post('/api/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          imageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          imageUrl = '';
        }
      }

      const payload = { ...form, imagenUrl: imageUrl, operacionTomada: Boolean(form.operacionTomada), pipsStopLoss: Number(form.pipsStopLoss), pipsProfit: Number(form.pipsProfit), riesgoPorcentaje: Number(form.riesgoPorcentaje), profitPorcentaje: Number(form.profitPorcentaje), pipsReliquidacion: Number(form.pipsReliquidacion), ajusteStopLossPips: Number(form.ajusteStopLossPips), pipsObjetivo: Number(form.pipsObjetivo), porcentajeObjetivo: Number(form.porcentajeObjetivo) };
      if (editingId) {
        await axios.put(`/api/operaciones/${editingId}`, payload);
      } else {
        await axios.post('/api/operaciones', payload);
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
    setForm({
      fechaHora: op.fechaHora ? new Date(op.fechaHora).toISOString().slice(0, 16) : '',
      sesion: op.sesion?._id || op.sesion || '',
      par: op.par?._id || op.par || '',
      liquidez: op.liquidez || 'imbalance',
      liquidezEnSesion: Boolean(op.liquidezEnSesion),
      timeframeLiquidez: op.timeframeLiquidez?._id || op.timeframeLiquidez || '',
      quiebreTendenciaEntrada: Boolean(op.quiebreTendenciaEntrada),
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
      alcanzaTarget: Boolean(op.alcanzaTarget),
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
      await axios.delete(`/api/operaciones/${id}`);
      await fetchData();
    } catch (err) {
      setError('No se pudo eliminar la operación');
    }
  };

  const filteredOperaciones = operaciones.filter((op) => {
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
    if (filters.timeframeLiquidez && String(op.timeframeLiquidez?._id || op.timeframeLiquidez) !== String(filters.timeframeLiquidez)) return false;
    if (filters.quiebreTendenciaEntrada !== '' && String(op.quiebreTendenciaEntrada) !== filters.quiebreTendenciaEntrada) return false;
    if (filters.reliquida !== '' && String(op.reliquida) !== filters.reliquida) return false;
    if (filters.objetivoPrecio && op.objetivoPrecio !== filters.objetivoPrecio) return false;
    if (filters.timeframeObjetivo && String(op.timeframeObjetivo?._id || op.timeframeObjetivo) !== String(filters.timeframeObjetivo)) return false;
    if (filters.alcanzaTarget !== '' && String(op.alcanzaTarget) !== filters.alcanzaTarget) return false;

    return true;
  });

  const dashboardStats = filteredOperaciones.reduce(
    (acc, op) => {
      const profit = Number(op.profitPorcentaje) || 0;
      const risk = Number(op.riesgoPorcentaje) || 0;
      acc.totalOperaciones += 1;

      if (op.resultadoOperacion === 'ganada') {
        acc.totalProfitsNetos += profit;
      } else if (op.resultadoOperacion === 'perdida') {
        acc.totalProfitsNetos -= risk;
      }

      return acc;
    },
    { totalProfitsNetos: 0, totalOperaciones: 0 }
  );

  return (
    <div>
      {!showForm && !editingId && (
        <div className="panel">
          <div className="row">
            <button onClick={handleOpenForm}>Nueva operación</button>
          </div>
        </div>
      )}

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
                <label>Timeframe liquidez<select name="timeframeLiquidez" value={form.timeframeLiquidez} onChange={handleChange} required><option value="">Selecciona</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
                <label>Quiebre tendencia entrada<input name="quiebreTendenciaEntrada" type="checkbox" checked={form.quiebreTendenciaEntrada} onChange={handleChange} /></label>
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
                <label>Alcanza objetivo<input name="alcanzaTarget" type="checkbox" checked={form.alcanzaTarget} onChange={handleChange} /></label>
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
              <h3>Operaciones</h3>
              <p>{dashboardStats.totalOperaciones}</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 style={{ margin: '0 0 10px' }}>Filtros</h2>
          <div className="grid">
            <label>Desde<input name="fechaDesde" type="date" value={filters.fechaDesde} onChange={handleFilterChange} /></label>
            <label>Hasta<input name="fechaHasta" type="date" value={filters.fechaHasta} onChange={handleFilterChange} /></label>
            <label>Sesión<select name="sesion" value={filters.sesion} onChange={handleFilterChange}><option value="">Todas</option>{sesiones.map((s) => <option key={s._id} value={s._id}>{s.nombre}</option>)}</select></label>
            <label>Par<select name="par" value={filters.par} onChange={handleFilterChange}><option value="">Todos</option>{pares.map((p) => <option key={p._id} value={p._id}>{p.nombre}</option>)}</select></label>
            <label>Liquidez<select name="liquidez" value={filters.liquidez} onChange={handleFilterChange}><option value="">Todas</option><option value="imbalance">Imbalance</option><option value="minimo">Mínimo</option><option value="maximo">Máximo</option></select></label>
            <label>Liquidez en sesión<select name="liquidezEnSesion" value={filters.liquidezEnSesion} onChange={handleFilterChange}><option value="">Todas</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Timeframe liquidez<select name="timeframeLiquidez" value={filters.timeframeLiquidez} onChange={handleFilterChange}><option value="">Todos</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
            <label>Quiebre tendencia entrada<select name="quiebreTendenciaEntrada" value={filters.quiebreTendenciaEntrada} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Reliquida<select name="reliquida" value={filters.reliquida} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
            <label>Objetivo precio<select name="objetivoPrecio" value={filters.objetivoPrecio} onChange={handleFilterChange}><option value="">Todos</option><option value="imbalance">Imbalance</option><option value="minimo">Mínimo</option><option value="maximo">Máximo</option></select></label>
            <label>Timeframe objetivo<select name="timeframeObjetivo" value={filters.timeframeObjetivo} onChange={handleFilterChange}><option value="">Todos</option>{timeframes.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}</select></label>
            <label>Alcanza target<select name="alcanzaTarget" value={filters.alcanzaTarget} onChange={handleFilterChange}><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Operaciones</h2>
        {loading ? <p>Cargando...</p> : (
          <table className="table">
            <thead>
              <tr><th>Fecha</th><th>Par</th><th>Sesión</th><th>Descripción</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filteredOperaciones.map((op) => (
                <tr key={op._id}>
                  <td>{new Date(op.fechaHora).toLocaleString()}</td>
                  <td>{op.par?.nombre || '—'}</td>
                  <td>{op.sesion?.nombre || '—'}</td>
                  <td>{op.descripcion}</td>
                  <td className="actions-cell">
                    <div className="row">
                      <button onClick={() => navigate(`/operaciones/${op._id}`)}>Ver</button>
                      <button className="secondary" onClick={() => handleEdit(op)}>Editar</button>
                      <button className="danger" onClick={() => handleDelete(op._id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OperacionesPage;
