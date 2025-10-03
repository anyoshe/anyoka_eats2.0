import React from 'react';

export default function ResponsiveList({ items, renderCard }){
  return (
    <div className="card-list">
      {items.map((item, idx) => (
        <div key={item.id ?? idx} className="card">
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}





