import React from "react";
import "./WeeklyBar.css";

const diasLabel = ["S", "T", "Q", "Q", "S", "S", "D"];

function WeeklyBar({ nome, progresso, semanal, total }) {
  return (
    <div className="weeklybar-container">

      <h5 className="weeklybar-title">{nome}</h5>

      {/* GRID ÚNICO: letra + quadrado empilhados */}
      <div className="weeklybar-fullgrid">

        {progresso.map((feito, i) => (
          <div key={i} className="weeklybar-col">
            <div className="weeklybar-day-label">{diasLabel[i]}</div>

            <div
              className="weeklybar-block"
              style={{ backgroundColor: feito ? "#d32f2f" : "#555" }}
            ></div>
          </div>
        ))}

        {/* BADGES AO LADO DO GRID */}
        <div className="weeklybar-badges-inline">
          <div className="badge-semanal">🔥 {semanal}</div>
          <div className="badge-total">⭐ {total}</div>
        </div>
      </div>

    </div>
  );
}

export default WeeklyBar;
