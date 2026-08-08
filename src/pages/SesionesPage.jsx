import { useEffect, useState } from 'react';
import api from '../services/api';

function SesionesPage() {
  const [sesiones, setSesiones] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    const res = await api.get('/sesiones');
    setSesiones(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/sesiones/${editingId}`, { nombre });
    } else {
      await api.post('/sesiones', { nombre });
    }
    setNombre('');
    setEditingId(null);
    fetchData();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setNombre(item.nombre);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta sesión?')) return;
    await api.delete(`/sesiones/${id}`);
    fetchData();
  };

  return (
    <div className="panel">
      <h2>CRUD de sesiones</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
        <div className="row">
          <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setNombre(''); }}>Cancelar</button>}
        </div>
      </form>
      <ul>
        {sesiones.map((item) => (
          <li key={item._id} className="list-item-row">
            <span>{item.nombre}</span>
            <span className="row">
              <button className="secondary" onClick={() => handleEdit(item)}>Editar</button>
              <button className="danger" onClick={() => handleDelete(item._id)}>Eliminar</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SesionesPage;
