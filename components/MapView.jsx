'use client';
import { useEffect, useRef, useState } from 'react';

// OpenStreetMap + Leaflet. items: [{id, name, lat, lng, rank?, kind: 'rank'|'ex'|'nodata', html}]
const HOUSE = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-9 1.5 0-8l9 9.5V9a1.5 1.5 0 0 1-1.5 1.5H4.5V4h-9v6.5h-3A1.5 1.5 0 0 1-9 9z" fill="#fff"/></svg>';

export default function MapView({ home, reachKm, items, activeId, onSelect, label }) {
  const el = useRef(null);
  const st = useRef({ map: null, L: null, layer: null, markers: {} });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (dead || !el.current || st.current.map) return;
        const map = L.map(el.current, { scrollWheelZoom: false }).setView([37.5, 127.03], 11);
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
        let errs = 0;
        tiles.on('tileerror', () => { if (++errs === 3) setMsg('지도 타일을 불러오지 못했어요. 네트워크 상태를 확인해 주세요. 마커 위치는 정상이에요.'); });
        st.current = { map, L, layer: L.layerGroup().addTo(map), markers: {} };
        setMsg('ready');
      } catch (e) { setMsg('지도 라이브러리를 불러오지 못했어요.'); }
    })();
    return () => { dead = true; if (st.current.map) { st.current.map.remove(); st.current = { map: null, L: null, layer: null, markers: {} }; } };
  }, []);

  useEffect(() => {
    const { map, L, layer } = st.current;
    if (!map || !home) return;
    layer.clearLayers();
    st.current.markers = {};
    const pts = [home];
    L.marker(home, { icon: L.divIcon({ className: '', html: `<div class="pin-home" aria-label="내 주소 지역">${HOUSE}</div>`, iconSize: [42, 42], iconAnchor: [21, 21] }), zIndexOffset: 1000 }).addTo(layer).bindPopup('<b>내 주소 지역</b>');
    const circle = L.circle(home, { radius: reachKm * 1000, color: '#3182f6', weight: 2, dashArray: '7 7', fillColor: '#3182f6', fillOpacity: 0.08, interactive: false }).addTo(layer);
    if (label) {
      const north = [home[0] + reachKm / 110.57, home[1]];
      L.marker(north, { icon: L.divIcon({ className: '', html: `<div class="reach-label">${label}</div>`, iconSize: [0, 0] }), interactive: false, zIndexOffset: 900 }).addTo(layer);
      pts.push(north);
    }
    items.forEach((it) => {
      const cls = it.kind === 'rank' ? `pin${it.rank === 1 ? ' first' : ''}` : it.kind === 'ex' ? 'pin ex' : 'pin nodata';
      const size = it.kind === 'rank' && it.rank === 1 ? 36 : 30;
      const txt = it.kind === 'rank' ? it.rank : it.kind === 'ex' ? '×' : '·';
      const m = L.marker([it.lat, it.lng], { icon: L.divIcon({ className: '', html: `<div class="${cls}">${txt}</div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] }), zIndexOffset: it.kind === 'rank' ? 500 - (it.rank || 0) : 0 }).addTo(layer).bindPopup(it.html);
      m.on('click', () => onSelect && onSelect(it.id));
      st.current.markers[it.id] = m;
      if (it.kind !== 'ex') pts.push([it.lat, it.lng]);
    });
    const b = circle.getBounds();
    pts.forEach((p) => b.extend(p));
    map.fitBounds(b.pad(0.08));
    setTimeout(() => map.invalidateSize(), 60);
  }, [home, reachKm, items, msg === 'ready']); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const { map, markers } = st.current;
    const m = activeId && markers[activeId];
    if (map && m) { map.flyTo(m.getLatLng(), 14, { duration: 0.6 }); setTimeout(() => m.openPopup(), 650); }
  }, [activeId]);

  return (
    <div className="mapwrap">
      <div ref={el} className="map" role="region" aria-label="회사 위치 지도" />
      {label ? <span className="map-chip"><i />{label}</span> : null}
      {msg && msg !== 'ready' ? <p className="map-msg">{msg}</p> : null}
    </div>
  );
}
