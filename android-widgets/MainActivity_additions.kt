/**
 * INSTRUCCIONES PARA MODIFICAR MainActivity.kt
 * 
 * Archivo: android/app/src/main/java/app/lovable/propositos2026/MainActivity.kt
 * 
 * 1. Añade estos imports al inicio del archivo:
 */

// === AÑADIR ESTOS IMPORTS ===
import app.lovable.propositos2026.widgets.WidgetBridge

/**
 * 2. Dentro de la clase MainActivity, sobrescribe el método onCreate:
 */

// === AÑADIR ESTE MÉTODO EN LA CLASE MainActivity ===
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Registrar el bridge para comunicación con widgets
    bridge.webView.addJavascriptInterface(WidgetBridge(this), "AndroidWidget")
}

/**
 * El archivo completo debería verse así:
 * 
 * package app.lovable.propositos2026
 * 
 * import android.os.Bundle
 * import com.getcapacitor.BridgeActivity
 * import app.lovable.propositos2026.widgets.WidgetBridge
 * 
 * class MainActivity : BridgeActivity() {
 *     override fun onCreate(savedInstanceState: Bundle?) {
 *         super.onCreate(savedInstanceState)
 *         bridge.webView.addJavascriptInterface(WidgetBridge(this), "AndroidWidget")
 *     }
 * }
 */
