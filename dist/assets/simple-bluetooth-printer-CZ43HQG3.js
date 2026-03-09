import{C as s,B as c}from"./index-D8mbdtdE.js";const r="\x1B",a="";class d{constructor(){this.connectedDevice=null,this.writeCharacteristic=null,this.PRINTER_SERVICE_UUIDS=["000018f0-0000-1000-8000-00805f9b34fb","49535343-fe7d-4ae5-8fa9-9fafd205e455","e7810a71-73ae-499d-8c15-faa9aef0c3f2"]}async initialize(){try{if(!s.isNativePlatform())throw new Error("Bluetooth only works on native platforms");console.log("🔵 Initializing BLE..."),await c.initialize(),console.log("✅ BLE initialized")}catch(t){throw console.error("❌ BLE initialization failed:",t),t}}async scanForPrinters(t){try{console.log("🔍 Starting Bluetooth scan...");const e=new Map;await c.requestLEScan({},i=>{if(i.device.name&&i.device.name.length>0){const n=i.device.deviceId;if(!e.has(n)){const o={id:n,name:i.device.name,address:n,rssi:i.rssi};e.set(n,o),console.log(`📱 Found device: ${o.name} (${n})`),t(o)}}}),await new Promise(i=>setTimeout(i,1e4)),await c.stopLEScan(),console.log(`✅ Scan complete - found ${e.size} devices`)}catch(e){throw console.error("❌ Scan failed:",e),e}}async connect(t){try{console.log(`🔵 Connecting to device: ${t}`),this.connectedDevice&&await this.disconnect(),await c.connect(t,()=>{console.log("🔌 Device disconnected unexpectedly"),this.connectedDevice=null,this.writeCharacteristic=null}),console.log("✅ Connected! Discovering services...");const e=await c.getServices(t);console.log(`📋 Found ${e.length} services`);for(const i of e){console.log(`🔍 Service: ${i.uuid}`);for(const n of i.characteristics)if(console.log(`  📝 Characteristic: ${n.uuid}`),n.properties.write||n.properties.writeWithoutResponse){this.writeCharacteristic=n.uuid,console.log(`✅ Found write characteristic: ${n.uuid}`);break}if(this.writeCharacteristic)break}if(!this.writeCharacteristic)throw new Error("Could not find write characteristic for printer");return this.connectedDevice={deviceId:t},console.log("✅ Printer ready for printing!"),!0}catch(e){throw console.error("❌ Connection failed:",e),this.connectedDevice=null,this.writeCharacteristic=null,e}}async disconnect(){if(this.connectedDevice){try{await c.disconnect(this.connectedDevice.deviceId),console.log("✅ Disconnected from printer")}catch(t){console.error("❌ Disconnect error:",t)}this.connectedDevice=null,this.writeCharacteristic=null}}isConnected(){return this.connectedDevice!==null&&this.writeCharacteristic!==null}async sendRaw(t){if(!this.connectedDevice||!this.writeCharacteristic)throw new Error("Printer not connected");try{const e=new TextEncoder().encode(t),i=new DataView(e.buffer);await c.write(this.connectedDevice.deviceId,this.writeCharacteristic.split("-")[0],this.writeCharacteristic,i)}catch(e){throw console.error("❌ Failed to send data:",e),e}}async printText(t){console.log("🖨️ Printing text...");let e="";e+=`${r}@`,e+=`${r}a`,e+=t,e+=`


`,e+=`${a}V\0`,await this.sendRaw(e),console.log("✅ Print job sent")}async printTestReceipt(){const t=`================================
       TEST RECEIPT
================================
Date: ${new Date().toLocaleString()}
Bluetooth Thermal Printer
================================
This is a test print
If you can see this,
the printer is working!
================================
`;await this.printText(t)}async printOrder(t){let e="";e+=`================================
`,e+=`     ORDER RECEIPT
`,e+=`================================
`,e+=`Order #${t.id||t.number||"N/A"}
`,e+=`Date: ${new Date().toLocaleString()}
`,e+=`--------------------------------
`,t.items&&Array.isArray(t.items)&&(e+=`ITEMS:
`,t.items.forEach(i=>{e+=`${i.quantity}x ${i.name}
`,i.price&&(e+=`   $${i.price.toFixed(2)}
`)}),e+=`--------------------------------
`),t.total&&(e+=`TOTAL: $${t.total.toFixed(2)}
`),e+=`================================
`,e+=`    Thank you!
`,e+=`================================
`,await this.printText(e)}}export{d as SimpleBluetoothPrinter,d as default};
