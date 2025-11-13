import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

/**
 * Genera una credencial VIP en formato JPEG con diseño diferenciado
 * @param {Object} credencial - Datos de la credencial (incluye tipo, token, numeroCredencial)
 */
export async function generarCredencialVIP(credencial) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Generando credencial VIP:', credencial)
      
      // Generar QR con el qrCode (no con el token UUID)
      const qrCodeData = credencial.qrCode || credencial.token
      const qrDataUrl = await QRCode.toDataURL(qrCodeData, {
        width: 500,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })

      // Crear contenedor temporal
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      document.body.appendChild(container)

      // Colores según el tipo
      const esVIP = credencial.tipo === 'VIP'
      const colorPrimario = esVIP ? '#FFD700' : '#C0C0C0'  // Dorado vs Platino
      const colorSecundario = esVIP ? '#FFA500' : '#E8E8E8'
      const nombreTipo = esVIP ? 'VIP' : 'SUPER VIP'
      const icono = esVIP ? '🌟' : '💎'

      // Crear HTML de la credencial
      container.innerHTML = `
        <div id="credencial-vip" style="
          width: 1080px;
          height: 1920px;
          position: relative;
          background: linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%);
          font-family: 'Arial Black', 'Arial', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 60px 80px;
          box-sizing: border-box;
        ">
          <!-- Header -->
          <div style="
            text-align: center;
            width: 100%;
          ">
            <div style="
              font-size: 120px;
              margin-bottom: 20px;
            ">${icono}</div>
            
            <h1 style="
              font-size: 96px;
              font-weight: 900;
              color: ${esVIP ? '#8B4513' : '#2C3E50'};
              margin: 0 0 15px 0;
              text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
              letter-spacing: 8px;
            ">FEIPOBOL 2025</h1>
            
            <div style="
              font-size: 72px;
              font-weight: 900;
              color: ${esVIP ? '#FFFFFF' : '#4A4A4A'};
              background: ${esVIP ? 'rgba(139, 69, 19, 0.8)' : 'rgba(44, 62, 80, 0.8)'};
              padding: 25px 50px;
              border-radius: 20px;
              display: inline-block;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
              letter-spacing: 6px;
              border: 5px solid ${esVIP ? '#FFFFFF' : '#2C3E50'};
            ">PASE ${nombreTipo}</div>
          </div>

          <!-- Número de Credencial -->
          <div style="
            width: 100%;
            text-align: center;
            background: ${esVIP ? 'rgba(139, 69, 19, 0.6)' : 'rgba(44, 62, 80, 0.6)'};
            padding: 30px;
            border-radius: 20px;
            border: 4px solid ${esVIP ? '#FFFFFF' : '#2C3E50'};
          ">
            <div style="
              font-size: 42px;
              color: #FFFFFF;
              font-weight: bold;
              margin-bottom: 10px;
              letter-spacing: 2px;
            ">CREDENCIAL N°</div>
            <div style="
              font-size: 96px;
              font-weight: 900;
              color: #FFFFFF;
              text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
              letter-spacing: 6px;
            ">${String(credencial.numeroCredencial).padStart(4, '0')}</div>
          </div>

          <!-- QR Code -->
          <div style="
            background: white;
            padding: 30px;
            border-radius: 30px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
            border: 8px solid ${esVIP ? '#8B4513' : '#2C3E50'};
          ">
            <img src="${qrDataUrl}" style="
              width: 500px;
              height: 500px;
              display: block;
            " />
          </div>

          <!-- Validaciones -->
          <div style="
            width: 100%;
            text-align: center;
            background: ${esVIP ? 'rgba(139, 69, 19, 0.6)' : 'rgba(44, 62, 80, 0.6)'};
            padding: 25px;
            border-radius: 15px;
            border: 4px solid ${esVIP ? '#FFFFFF' : '#2C3E50'};
          ">
            <div style="
              font-size: 36px;
              color: #FFFFFF;
              font-weight: bold;
              letter-spacing: 2px;
            ">✓ ACCESO VÁLIDO PARA 2 INGRESOS</div>
          </div>

          <!-- Footer -->
          <div style="
            width: 100%;
            text-align: center;
            font-size: 32px;
            color: ${esVIP ? '#8B4513' : '#2C3E50'};
            font-weight: bold;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
          ">EN EL BICENTENARIO DE BOLIVIA 🇧🇴</div>
        </div>
      `

      // Detectar si es dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const scale = isMobile ? 1.5 : 2
      const quality = isMobile ? 0.85 : 0.92

      // Esperar un momento para que el DOM se actualice
      setTimeout(() => {
        html2canvas(container.querySelector('#credencial-vip'), {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        }).then(canvas => {
          // Convertir canvas a imagen JPEG
          const imgData = canvas.toDataURL('image/jpeg', quality)
          
          // Crear enlace de descarga
          const link = document.createElement('a')
          const nombreArchivo = `Credencial-${nombreTipo.replace(' ', '_')}-${String(credencial.numeroCredencial).padStart(4, '0')}.jpg`
          link.download = nombreArchivo
          link.href = imgData
          link.click()

          // Limpiar
          document.body.removeChild(container)
          resolve()
        }).catch(error => {
          document.body.removeChild(container)
          reject(error)
        })
      }, 500)

    } catch (error) {
      console.error('Error generando credencial VIP:', error)
      reject(error)
    }
  })
}
