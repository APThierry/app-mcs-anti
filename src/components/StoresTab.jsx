import React, { useState } from 'react';
import { Search, MapPin, Clock, Phone, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import { realStoresData } from '../data/realData';

export default function StoresTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStore, setSelectedStore] = useState(null);

  const categories = [
    'Todas', 
    'Alimentação', 
    'Vestuário', 
    'Diversão', 
    'Perfumaria', 
    'Calçados', 
    'Serviços', 
    'Academia'
  ];

  const filteredStores = realStoresData.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.floor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || 
                            store.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Seção de Detalhe da Loja Aberta */}
      {selectedStore ? (
        <div className="glass-card" style={{ padding: '20px' }}>
          <button 
            onClick={() => setSelectedStore(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-primary)',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Voltar para a lista de lojas
          </button>

          <img 
            src={selectedStore.image_url} 
            alt={selectedStore.name} 
            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '14px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            {selectedStore.name}
          </h3>

          <span style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: '800', display: 'block', marginBottom: '14px' }}>
            {selectedStore.category}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#CBD5E1' }}>
              <MapPin size={16} color="var(--brand-primary)" />
              <span>{selectedStore.floor}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#CBD5E1' }}>
              <Clock size={16} color="var(--brand-primary)" />
              <span>Horário: 10:00 às 22:00</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#CBD5E1' }}>
              <Phone size={16} color="#06B6D4" />
              <span>Telefone Oficial: <strong>{selectedStore.phone}</strong></span>
            </div>
          </div>

          <a 
            href={`tel:${selectedStore.phone?.replace(/\D/g, '')}`}
            className="btn-primary-action"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px' }}
          >
            <Phone size={18} /> Ligar para {selectedStore.name}
          </a>
        </div>
      ) : (
        <>
          {/* Busca de Lojas */}
          <div className="search-bar">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Buscar por loja, segmento ou setor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categorias Chips */}
          <div className="category-scroll-chips">
            {categories.map((cat) => (
              <button 
                key={cat} 
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px', fontWeight: '700', paddingLeft: '4px' }}>
            Exibindo {filteredStores.length} lojas no Monte Carmo Shopping
          </div>

          {/* Lista de Cards de Lojas */}
          <div className="stores-list">
            {filteredStores.map((store) => (
              <div 
                key={store.id} 
                className="store-card"
                onClick={() => setSelectedStore(store)}
              >
                <div className="store-avatar">
                  <span style={{ fontSize: '20px' }}>{store.logo_icon || '🏬'}</span>
                </div>

                <div className="store-info">
                  <h4>{store.name}</h4>
                  <div className="store-meta">
                    <span>{store.category}</span>
                    <span>•</span>
                    <span>{store.floor}</span>
                  </div>
                  <div className="store-phone-tag">
                    <Phone size={12} />
                    <span>{store.phone}</span>
                  </div>
                </div>

                <ChevronRight size={18} color="#10B981" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
