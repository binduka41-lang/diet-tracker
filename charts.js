/**
 * NutriTrack Modern Canvas Charting Engine
 * Self-contained, responsive, crisp retina charts with zero external dependencies.
 * - Weekly Calorie Bar Chart with Target Threshold
 * - Macro Breakdown / Trends Chart
 * - Weight History Line & Trend Chart
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NutriTrack = root.NutriTrack || {};
    root.NutriTrack.Charts = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  function setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    const displayWidth = rect.width > 0 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 500);
    const displayHeight = canvas.getAttribute("height") ? parseInt(canvas.getAttribute("height")) : 220;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.resetTransform && ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { ctx, width: displayWidth, height: displayHeight };
  }

  /**
   * Renders the 7-day Calorie History Bar Chart with Daily Target benchmark.
   * daysData: array of { label: "Mon 28", date: "2026-10-28", calories: 1850, target: 2000 }
   */
  function renderCalorieChart(canvasId, daysData, calorieTarget) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!daysData || daysData.length === 0) {
      ctx.fillStyle = "#9aa59e";
      ctx.font = "500 13px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No diary entries yet for this period.", width / 2, height / 2);
      return;
    }

    const padding = { top: 25, right: 20, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(calorieTarget * 1.15, ...daysData.map(d => d.calories || 0), 1500);

    // Draw horizontal grid lines
    const gridSteps = 4;
    ctx.strokeStyle = "#edf1ed";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8a968f";
    ctx.font = "500 10px 'DM Sans', sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= gridSteps; i++) {
      const yVal = Math.round((maxVal / gridSteps) * i);
      const yPos = padding.top + chartH - (yVal / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(`${yVal}`, padding.left - 8, yPos + 3);
    }

    // Target benchmark line
    if (calorieTarget && calorieTarget > 0) {
      const targetY = padding.top + chartH - (calorieTarget / maxVal) * chartH;
      ctx.save();
      ctx.strokeStyle = "#e6a64e";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, targetY);
      ctx.lineTo(width - padding.right, targetY);
      ctx.stroke();

      ctx.fillStyle = "#c88528";
      ctx.font = "600 10px 'DM Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Target: ${calorieTarget} kcal`, width - padding.right, targetY - 4);
      ctx.restore();
    }

    // Bars
    const barCount = daysData.length;
    const slotW = chartW / barCount;
    const barW = Math.min(32, slotW * 0.55);

    daysData.forEach((item, idx) => {
      const x = padding.left + (idx * slotW) + (slotW - barW) / 2;
      const barH = (item.calories / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      // Gradient fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (item.calories > (calorieTarget || 2000) * 1.05) {
        grad.addColorStop(0, "#f97316"); // amber-orange if above
        grad.addColorStop(1, "#fbbf24");
      } else {
        grad.addColorStop(0, "#287c5a"); // forest emerald
        grad.addColorStop(1, "#44a67d");
      }

      ctx.fillStyle = grad;
      // Draw rounded top bar
      const radius = Math.min(6, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();

      // Value on top of bar
      if (item.calories > 0) {
        ctx.fillStyle = "#1d2c25";
        ctx.font = "700 10px 'Manrope', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(item.calories)}`, x + barW / 2, y - 5);
      }

      // X-axis day label
      ctx.fillStyle = "#6e7c75";
      ctx.font = "600 10px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.label || "", x + barW / 2, height - padding.bottom + 15);
    });
  }

  /**
   * Renders the Weekly Protein & Macro Breakdown Chart.
   * daysData: array of { label: "Mon", protein: 95, carbs: 220, fats: 55 }
   */
  function renderMacroChart(canvasId, daysData, proteinTarget) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!daysData || daysData.length === 0) {
      ctx.fillStyle = "#9aa59e";
      ctx.font = "500 13px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No macro data logged for this period.", width / 2, height / 2);
      return;
    }

    const padding = { top: 25, right: 20, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(proteinTarget * 1.3, ...daysData.map(d => d.protein || 0), 120);

    // Draw horizontal grid lines
    const gridSteps = 4;
    ctx.strokeStyle = "#edf1ed";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8a968f";
    ctx.font = "500 10px 'DM Sans', sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= gridSteps; i++) {
      const yVal = Math.round((maxVal / gridSteps) * i);
      const yPos = padding.top + chartH - (yVal / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(`${yVal}g`, padding.left - 8, yPos + 3);
    }

    // Protein Target line
    if (proteinTarget && proteinTarget > 0) {
      const targetY = padding.top + chartH - (proteinTarget / maxVal) * chartH;
      ctx.save();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, targetY);
      ctx.lineTo(width - padding.right, targetY);
      ctx.stroke();

      ctx.fillStyle = "#059669";
      ctx.font = "600 10px 'DM Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Target: ${proteinTarget}g`, width - padding.right, targetY - 4);
      ctx.restore();
    }

    // Bars for protein
    const barCount = daysData.length;
    const slotW = chartW / barCount;
    const barW = Math.min(26, slotW * 0.5);

    daysData.forEach((item, idx) => {
      const x = padding.left + (idx * slotW) + (slotW - barW) / 2;
      const barH = ((item.protein || 0) / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      ctx.fillStyle = "#10b981";
      const radius = Math.min(5, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();

      if (item.protein > 0) {
        ctx.fillStyle = "#065f46";
        ctx.font = "700 10px 'Manrope', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(item.protein)}g`, x + barW / 2, y - 5);
      }

      ctx.fillStyle = "#6e7c75";
      ctx.font = "600 10px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.label || "", x + barW / 2, height - padding.bottom + 15);
    });
  }

  /**
   * Renders the Weight Progression Line Chart.
   * history: array of { date: "2026-10-20", weight: 62.4 }
   */
  function renderWeightChart(canvasId, history, goalWeight) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!history || history.length === 0) {
      ctx.fillStyle = "#9aa59e";
      ctx.font = "500 13px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No weight logs recorded yet. Log your first weight entry above!", width / 2, height / 2);
      return;
    }

    const padding = { top: 25, right: 30, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const weights = history.map(h => h.weight);
    const minW = Math.floor(Math.min(...weights) - 2);
    const maxW = Math.ceil(Math.max(...weights) + 2);
    const range = Math.max(4, maxW - minW);

    // Grid lines
    const gridSteps = 4;
    ctx.strokeStyle = "#edf1ed";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8a968f";
    ctx.font = "500 10px 'DM Sans', sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= gridSteps; i++) {
      const yVal = Math.round((minW + (range / gridSteps) * i) * 10) / 10;
      const yPos = padding.top + chartH - ((yVal - minW) / range) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(`${yVal} kg`, padding.left - 8, yPos + 3);
    }

    const points = history.map((item, idx) => {
      const x = history.length === 1
        ? padding.left + chartW / 2
        : padding.left + (idx / (history.length - 1)) * chartW;
      const y = padding.top + chartH - ((item.weight - minW) / range) * chartH;
      return { x, y, weight: item.weight, date: item.date };
    });

    // Draw line
    ctx.strokeStyle = "#287c5a";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Fill gradient under curve
    if (points.length > 1) {
      const fillGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      fillGrad.addColorStop(0, "rgba(40, 124, 90, 0.2)");
      fillGrad.addColorStop(1, "rgba(40, 124, 90, 0.0)");
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    // Points & labels
    points.forEach(pt => {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#287c5a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1d2c25";
      ctx.font = "700 10px 'Manrope', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${pt.weight}`, pt.x, pt.y - 8);

      ctx.fillStyle = "#6e7c75";
      ctx.font = "500 9px 'DM Sans', sans-serif";
      const datePart = pt.date.slice(5); // 'MM-DD'
      ctx.fillText(datePart, pt.x, height - padding.bottom + 15);
    });
  }

  return {
    renderCalorieChart: renderCalorieChart,
    renderMacroChart: renderMacroChart,
    renderWeightChart: renderWeightChart
  };
}));
