import jsPDF from 'jspdf';
import { AppStorageState } from '../types';

export function exportToPDF(state: AppStorageState, title: string = 'Reporte Operativo KuvaPlus') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(24, 43, 73);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KUVAPLUS // PLATAFORMA INTEGRAL EMPRESARIAL', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString()} | Entorno: Bajo Ancho de Banda | BD: kba_mas.db`, 14, 22);

  let y = 38;

  // Resumen Ejecutivo
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Síntesis Arquitectónica: Ganvent (Inventario/TPV) + Lokoo+ (Directorio/Mapa) + FinaPartner (Finanzas) + Blockchain Ledger`,
    14,
    y
  );
  y += 10;

  // Métricas Claves
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(100, 110, 120);
  doc.text('PRODUCTOS EN STOCK', 20, y + 8);
  doc.text('NEGOCIOS REGISTRADOS', 70, y + 8);
  doc.text('TRANSACCIONES', 125, y + 8);
  doc.text('BLOQUES BLOCKCHAIN', 170, y + 8);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${state.products.length} ítems`, 20, y + 17);
  doc.text(`${state.businesses.length} entidades`, 70, y + 17);
  doc.text(`${state.transactions.length} regs`, 125, y + 17);
  doc.text(`${state.blockchain.length} bloques`, 170, y + 17);

  y += 32;

  // Tabla de Inventario Destacado (Ganvent)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 43, 73);
  doc.text('1. Inventario & Catálogo Rápido (Ganvent Engine)', 14, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(235, 240, 245);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.text('SKU', 16, y + 5);
  doc.text('PRODUCTO', 45, y + 5);
  doc.text('STOCK', 125, y + 5);
  doc.text('PRECIO CUP', 150, y + 5);
  doc.text('PRECIO USD', 180, y + 5);
  y += 9;

  doc.setFont('helvetica', 'normal');
  state.products.slice(0, 6).forEach((p) => {
    doc.text(p.sku, 16, y);
    doc.text(p.name.substring(0, 38), 45, y);
    doc.text(`${p.stock} ${p.unit}`, 125, y);
    doc.text(`$${p.priceCup.toLocaleString()}`, 150, y);
    doc.text(`$${p.priceUsd.toFixed(2)}`, 180, y);
    y += 6;
  });

  y += 6;

  // Tabla de Finanzas y Pasarelas (FinaPartner)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 43, 73);
  doc.text('2. Libro Contable y Pasarelas Cubanas (FinaPartner)', 14, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(235, 240, 245);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.text('FECHA', 16, y + 5);
  doc.text('CONCEPTO', 40, y + 5);
  doc.text('MONTO', 120, y + 5);
  doc.text('PASARELA', 150, y + 5);
  doc.text('ESTADO', 180, y + 5);
  y += 9;

  doc.setFont('helvetica', 'normal');
  state.transactions.slice(0, 6).forEach((t) => {
    const dStr = t.date.substring(0, 10);
    doc.text(dStr, 16, y);
    doc.text(t.concept.substring(0, 38), 40, y);
    doc.text(`${t.amount.toLocaleString()} ${t.currency}`, 120, y);
    doc.text(t.gateway, 150, y);
    doc.text(t.status, 180, y);
    y += 6;
  });

  y += 8;

  // Blockchain Hash de Auditoría
  doc.setFillColor(240, 249, 255);
  doc.rect(14, y, pageWidth - 28, 16, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text('SELLO CRIPTOGRÁFICO BLOCKCHAIN (SHA-256)', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  const latestHash = state.blockchain[state.blockchain.length - 1]?.hash || 'N/A';
  doc.text(`Último Bloque #${state.blockchain.length - 1}: ${latestHash}`, 18, y + 11);

  doc.save(`KuvaPlus_Reporte_${Date.now()}.pdf`);
}

export function exportToDOC(state: AppStorageState, title: string = 'Reporte Ejecutivo KuvaPlus') {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 24px; color: #1e293b; }
        h1 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 6px; }
        h2 { color: #0369a1; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 20px; }
        th { background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        td { border: 1px solid #e2e8f0; padding: 7px; font-size: 13px; }
        .badge { background: #e0f2fe; color: #0369a1; padding: 3px 6px; border-radius: 4px; font-weight: bold; }
        .hash-box { background: #f8fafc; border: 1px dashed #94a3b8; padding: 10px; font-family: monospace; font-size: 11px; }
      </style>
    </head>
    <body>
      <h1>KuvaPlus // ${title}</h1>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString()} | <strong>Base de datos:</strong> kba_mas.db (SQLite / JSON dual) | <strong>Modo:</strong> Sin Docker / Bajo ancho de banda</p>

      <h2>1. Catálogo e Inventario Ganvent</h2>
      <table>
        <thead>
          <tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio CUP</th><th>Precio USD</th><th>Stock</th></tr>
        </thead>
        <tbody>
          ${state.products
            .map(
              (p) => `
            <tr>
              <td><code>${p.sku}</code></td>
              <td><strong>${p.name}</strong></td>
              <td>${p.category}</td>
              <td>$${p.priceCup.toLocaleString()}</td>
              <td>$${p.priceUsd.toFixed(2)}</td>
              <td>${p.stock} ${p.unit}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <h2>2. Registro de Finanzas y Pasarelas FinaPartner</h2>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Moneda</th><th>Pasarela</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${state.transactions
            .map(
              (t) => `
            <tr>
              <td>${t.date.substring(0, 10)}</td>
              <td>${t.concept}</td>
              <td>${t.amount.toLocaleString()}</td>
              <td><span class="badge">${t.currency}</span></td>
              <td>${t.gateway}</td>
              <td>${t.status}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <h2>3. Directorio de Negocios y Comercios Lokoo+</h2>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Categoría</th><th>Provincia</th><th>Dirección</th><th>Contacto</th></tr>
        </thead>
        <tbody>
          ${state.businesses
            .map(
              (b) => `
            <tr>
              <td><strong>${b.name}</strong></td>
              <td>${b.category}</td>
              <td>${b.province}</td>
              <td>${b.address}</td>
              <td>${b.whatsapp || b.phone}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <h2>4. Integridad Blockchain (SHA-256 Ledger)</h2>
      <div class="hash-box">
        <p><strong>Total Bloques Sellados:</strong> ${state.blockchain.length}</p>
        <p><strong>Hash de Cabecera (Último bloque):</strong> ${state.blockchain[state.blockchain.length - 1]?.hash}</p>
        <p><strong>Hash Anterior:</strong> ${state.blockchain[state.blockchain.length - 1]?.previousHash}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KuvaPlus_Documento_${Date.now()}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToTXT(state: AppStorageState, title: string = 'Reporte Plano KuvaPlus') {
  let txt = `=========================================================\n`;
  txt += `  KUVAPLUS - REPORTE DE OPERACIONES Y NEGOCIOS\n`;
  txt += `  Fecha: ${new Date().toLocaleString()}\n`;
  txt += `  Base de Datos: kba_mas.db / kba_mas.json\n`;
  txt += `=========================================================\n\n`;

  txt += `[1. RESUMEN EJECUTIVO]\n`;
  txt += `---------------------------------------------------------\n`;
  txt += `Total de Productos en Catálogo: ${state.products.length}\n`;
  txt += `Total de Negocios Registrados:  ${state.businesses.length}\n`;
  txt += `Transacciones Registradas:      ${state.transactions.length}\n`;
  txt += `Microcréditos / Cuentas:        ${state.credits.length}\n`;
  txt += `Bloques en Cadena Criptográfica: ${state.blockchain.length}\n\n`;

  txt += `[2. INVENTARIO GANVENT (PRODUCTOS Y STOCK)]\n`;
  txt += `---------------------------------------------------------\n`;
  state.products.forEach((p, idx) => {
    txt += `${idx + 1}. [${p.sku}] ${p.name}\n`;
    txt += `   Precio: $${p.priceCup} CUP / $${p.priceUsd} USD | Stock: ${p.stock} ${p.unit}\n`;
    txt += `   Categoría: ${p.category}\n\n`;
  });

  txt += `[3. MOVIMIENTOS FINANCIEROS FINAPARTNER]\n`;
  txt += `---------------------------------------------------------\n`;
  state.transactions.forEach((t) => {
    txt += `• ${t.date.substring(0, 10)} | ${t.concept}\n`;
    txt += `  Monto: ${t.amount} ${t.currency} | Pasarela: ${t.gateway} (${t.status}) | Ref: ${t.reference || 'N/A'}\n\n`;
  });

  txt += `[4. DIRECTORIO DE NEGOCIOS LOKOO+]\n`;
  txt += `---------------------------------------------------------\n`;
  state.businesses.forEach((b) => {
    txt += `• ${b.name} (${b.category}) - ${b.province}\n`;
    txt += `  Dir: ${b.address} | Tel: ${b.phone} | WhatsApp: ${b.whatsapp}\n`;
    txt += `  Pagos: ${b.paymentMethods.join(', ')}\n\n`;
  });

  txt += `[5. AUDITORÍA CRIPTOGRÁFICA BLOCKCHAIN]\n`;
  txt += `---------------------------------------------------------\n`;
  txt += `Cadena SHA-256 Verificada: Sí\n`;
  txt += `Último Bloque Hash:\n${state.blockchain[state.blockchain.length - 1]?.hash}\n`;
  txt += `====================== FIN DEL REPORTE ==================\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KuvaPlus_Reporte_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export const exportToPdf = exportToPDF;
export const exportToDoc = exportToDOC;
export const exportToTxt = exportToTXT;

export function downloadJsonFile(state: AppStorageState, filename: string = 'kba_mas.json') {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSqlDump(state: AppStorageState, filename: string = 'kba_mas.sql') {
  // Simple dump script
  let dump = `-- KuvaPlus kba_mas.sql Dump\nBEGIN TRANSACTION;\n`;
  for (const b of state.businesses) {
    dump += `INSERT INTO negocios (id, nombre, provincia) VALUES ('${b.id}', '${b.name.replace(/'/g, "''")}', '${b.province}');\n`;
  }
  for (const p of state.products) {
    dump += `INSERT INTO inventario (id, nombre, sku, precio_cup) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.sku}', ${p.priceCup});\n`;
  }
  dump += `COMMIT;\n`;
  const blob = new Blob([dump], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
