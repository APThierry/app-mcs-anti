import React, { useState } from 'react';
import { Search, MapPin, Clock, MessageCircle, Star, Ticket, Film, Store, Play } from 'lucide-react';
import { storesData, realCinemaMovies } from '../data/mockData';

export default function StoresTab({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('stores'); // 'stores' or 'cinema'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  // Extract unique categories from real stores
  const categoriesSet = new Set(storesData.map(s => s.category).filter(Boolean));
  const filters = ['Todos', ...Array.from(categoriesSet).slice(0, 8)];

  const filteredStores = storesData.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.floor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedFilter === 'Todos') return true;
    return store.category === selectedFilter;
  });

  const filteredMovies = realCinemaMovies.filter(movie => {
    return movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      {/* Sub-tab Navigation (Lojas vs Cinema) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
        <button
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: activeSubTab === 'stores' ? 'var(--brand-primary)' : 'transparent',
            color: activeSubTab === 'stores' ? '#fff' : 'var(--text-muted)',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setActiveSubTab('stores')}
        >
          <Store size={15} /> Guia de Lojas ({storesData.length})
        </button>

        <button
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: activeSubTab === 'cinema' ? '#6366F1' : 'transparent',
            color: activeSubTab === 'cinema' ? '#fff' : 'var(--text-muted)',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setActiveSubTab('cinema')}
        >
          <Film size={15} /> Cineart Cinema ({realCinemaMovies.length})
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder={activeSubTab === 'stores' ? "Buscar loja (ex: Burger King, Cacau Show, Boliche)..." : "Buscar filme (ex: Terror, Romance, Ação)..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      {/* Stores View */}
      {activeSubTab === 'stores' && (
        <>
          {/* Category Pills */}
          <div className="filter-pills-row">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-pill ${selectedFilter === f ? 'active' : ''}`}
                onClick={() => setSelectedFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Stores List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStores.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Nenhuma loja encontrada.</p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.id} className="store-list-card">
                  <div className="store-left">
                    <div className="store-icon-box">{store.logo}</div>
                    <div>
                      <h4 className="store-name">{store.name}</h4>
                      <div className="store-sub" style={{ color: 'var(--brand-primary)', fontWeight: '700' }}>
                        {store.category}
                      </div>
                      <div className="store-sub" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <MapPin size={11} /> {store.floor}
                      </div>
                      <div className="store-sub" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={11} /> {store.hours} • Tel: {store.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <a 
                      href={`https://wa.me/${store.whatsapp}?text=Ol%C3%A1%20${encodeURIComponent(store.name)}%2C%20vi%20sua%20loja%20no%20App%20do%20MonteCarmo%20Shopping!`}
                      target="_blank"
                      rel="noreferrer"
                      className="store-whatsapp-btn"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>

                    {store.couponsCount > 0 && (
                      <button 
                        onClick={() => setActiveTab('coupons')}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-gold)', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Ticket size={12} /> {store.couponsCount} Cupons
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Cinema View */}
      {activeSubTab === 'cinema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', borderLeft: '4px solid #6366F1' }}>
              <div style={{ display: 'flex', gap: '14px', padding: '14px' }}>
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  style={{ width: '90px', height: '130px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2' }}>
                        {movie.title}
                      </h4>
                      <span style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '2px 6px', borderRadius: '4px' }}>
                        {movie.rating}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 8px 0' }}>
                      {movie.genre} • {movie.duration}
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {movie.synopsis}
                    </p>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <a 
                      href={movie.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '6px 12px',
                        background: '#6366F1',
                        color: '#fff',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Ticket size={12} /> Comprar Ingresso
                    </a>

                    {movie.trailer && (
                      <a 
                        href={movie.trailer}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'var(--text-main)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Play size={12} /> Trailer
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Sessions Bar */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 14px', fontSize: '11px', color: 'var(--brand-gold)', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} />
                <span>Sessões Hoje: <strong>{movie.sessions}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
