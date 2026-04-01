import React from "react";
import "./WeeklyBar.css";

const diasLabel = ["S", "T", "Q", "Q", "S", "S", "D"];

function WeeklyBar({ nome, progresso, semanal, total, datas, onDayClick }) {
  return (
    <div className="weeklybar-container">

      <h5 className="weeklybar-title">{nome}</h5>

      <div className="weeklybar-fullgrid">

        {progresso.map((feito, i) => (
          <div key={i} className="weeklybar-col">
            <div className="weeklybar-day-label">{diasLabel[i]}</div>

            <div
              className="weeklybar-block weeklybar-block-clickable"
              style={{ backgroundColor: feito ? "#e60000" : "#222", border: feito ? "1px solid #e60000" : "1px solid #333" }}
              title={datas?.[i] || ''}
              onClick={() => onDayClick && datas?.[i] && onDayClick(datas[i])}
            ></div>
          </div>
        ))}

        <div className="weeklybar-badges-inline">
          <div className="badge-semanal">{semanal}/7</div>
          <div className="badge-total">{total}</div>
        </div>
      </div>

    </div>
  );
}

export default WeeklyBar;
