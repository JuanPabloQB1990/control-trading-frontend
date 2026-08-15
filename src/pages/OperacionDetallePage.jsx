import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function OperacionDetallePage() {
  const { id } = useParams();
  const [operacion, setOperacion] = useState(null);

  useEffect(() => {
    api.get(`/operaciones/${id}`).then((res) => setOperacion(res.data));
  }, [id]);

  if (!operacion) return <div className="panel">Cargando...</div>;

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (value instanceof Date) return value.toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    return value;
  };

  const renderField = (label, value) => (
    <p><strong>{label}:</strong> {formatValue(value)}</p>
  );

  return (
    <div className="panel">
      <Link to="/">← Volver</Link>
      <h2>Detalle de operación</h2>
      <div className="grid">
        {renderField('Fecha y hora', operacion.fechaHora ? new Date(operacion.fechaHora).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '')}
        {renderField('Sesión', operacion.sesion?.nombre)}
        {renderField('Par', operacion.par?.nombre)}
        {renderField('Liquidez', operacion.liquidez)}
        {renderField('Liquidez en sesión', operacion.liquidezEnSesion)}
        {renderField('Liquida última vela 2h', operacion.liquidaUltimaVela2h)}
        {renderField('Timeframe liquidez', operacion.timeframeLiquidez?.nombre)}
        {renderField('Quiebre tendencia entrada', operacion.quiebreTendenciaEntrada)}
        {renderField('Timeframe imbalance entrada', operacion.timeframeImbalanceEntrada?.nombre)}
        {renderField('Descripción', operacion.descripcion)}
        {renderField('Pips stop loss', operacion.pipsStopLoss)}
        {renderField('Pips profit', operacion.pipsProfit)}
        {renderField('Riesgo %', operacion.riesgoPorcentaje)}
        {renderField('Profit %', operacion.profitPorcentaje)}
        {renderField('Reliquida', operacion.reliquida)}
        {renderField('Pips reliquidación', operacion.pipsReliquidacion)}
        {renderField('Ajuste stop loss pips', operacion.ajusteStopLossPips)}
        {renderField('Objetivo precio', operacion.objetivoPrecio)}
        {renderField('Timeframe objetivo', operacion.timeframeObjetivo?.nombre)}
        {renderField('Alcanza target', (operacion.alcanzaTarget === null || operacion.alcanzaTarget === undefined) ? 'Sin definir' : operacion.alcanzaTarget)}
        {renderField('Pips objetivo', operacion.pipsObjetivo)}
        {renderField('Porcentaje objetivo', operacion.porcentajeObjetivo)}
        {renderField('Resultado operación', operacion.resultadoOperacion)}
        {renderField('Operación tomada', operacion.operacionTomada)}
      </div>
      {operacion.imagenUrl && <div style={{ marginTop: '16px' }}><img src={operacion.imagenUrl} alt="Captura de operación" /></div>}
    </div>
  );
}

export default OperacionDetallePage;
