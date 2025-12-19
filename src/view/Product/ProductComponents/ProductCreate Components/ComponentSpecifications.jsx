import React from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ComponentSpecifications = ({
  selectedComponents,
  specifications,
  onSpecificationChange,
  isEditMode = false, // Add isEditMode prop
}) => {
  console.log("Selected Components:", selectedComponents); // Debug log
  console.log("Specifications:", specifications); // Debug log
  console.log("Is Edit Mode:", isEditMode); // Debug log

  // Handle specification field change for a specific component
  const handleFieldChange = (componentId, field, value) => {
    onSpecificationChange(componentId, field, value);
  };

  // Get specification fields based on component category
  const getSpecificationFields = (component) => {
    // Normalize the category, name, and id to lowercase
    const category = component.category?.toLowerCase().trim() || "";
    const name = component.name?.toLowerCase().trim() || "";
    const id = component.id?.toLowerCase().trim() || "";
    
    // Map common variations to standard categories
    const categoryMap = {
      // Processor variations
      'processor': 'processor',
      'cpu': 'processor',
      'processors': 'processor',
      
      // GPU variations
      'gpu': 'gpu',
      'graphics card': 'gpu',
      'graphics': 'gpu',
      'video card': 'gpu',
      'graphicscard': 'gpu',
      
      // Motherboard variations
      'motherboard': 'motherboard',
      'mobo': 'motherboard',
      'mainboard': 'motherboard',
      
      // RAM variations
      'ram': 'ram',
      'memory': 'ram',
      'ddr4': 'ram',
      'ddr5': 'ram',
      
      // Storage variations
      'ssd': 'ssd',
      'nvme': 'ssd',
      'solid state drive': 'ssd',
      'hdd': 'hdd',
      'hard drive': 'hdd',
      'hard disk': 'hdd',
      'storage': 'ssd',
      
      // PSU variations
      'psu': 'psu',
      'power supply': 'psu',
      'power supply unit': 'psu',
      'powersupply': 'psu',
      
      // Case variations
      'case': 'case',
      'chassis': 'case',
      'tower': 'case',
      'pc case': 'case',
      
      // Cooler variations
      'cooler': 'cooler',
      'cpu cooler': 'cooler',
      'cooling': 'cooler',
      'aio': 'cooler',
      'air cooler': 'cooler',
      'liquid cooler': 'cooler',
      'cpucooler': 'cooler',
      
      // Network card variations
      'network card': 'networkcard',
      'networkcard': 'networkcard',
      'wifi card': 'networkcard',
      'ethernet card': 'networkcard',
      'nic': 'networkcard',
      'network': 'networkcard',
      
      // Sound card variations
      'sound card': 'soundcard',
      'soundcard': 'soundcard',
      'audio card': 'soundcard',
      'audiocard': 'soundcard',
      
      // Monitor variations
      'monitor': 'monitor',
      'display': 'monitor',
      'screen': 'monitor',
      'monitors': 'monitor',
      
      // Keyboard variations
      'keyboard': 'keyboard',
      'keyboards': 'keyboard',
      'kbd': 'keyboard',
      'keybd': 'keyboard',
      'gaming keyboard': 'keyboard',
      'mechanical keyboard': 'keyboard',
      
      // Mouse variations
      'mouse': 'mouse',
      'mice': 'mouse',
      'gaming mouse': 'mouse',
      'mouses': 'mouse',
      
      // Peripherals - check name/id
      'peripherals': 'peripherals',
      'peripheral': 'peripherals',
    };

    // First check if name or id matches specific peripheral types
    let normalizedCategory = categoryMap[category] || category;
    
    // If category is "peripherals", check the name or id to determine specific type
    if (normalizedCategory === 'peripherals') {
      // Check if name contains keyboard
      if (name.includes('keyboard') || id.includes('keyboard')) {
        normalizedCategory = 'keyboard';
      }
      // Check if name contains mouse
      else if (name.includes('mouse') || id.includes('mouse')) {
        normalizedCategory = 'mouse';
      }
      // Check if name contains monitor
      else if (name.includes('monitor') || name.includes('display') || id.includes('monitor')) {
        normalizedCategory = 'monitor';
      }
    }

    // Define fields for each component category
    const fieldConfigs = {
      processor: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., AMD Ryzen 7 7700X" },
        { name: "cores", label: "Number of Cores", placeholder: "e.g., 8" },
        { name: "threads", label: "Number of Threads", placeholder: "e.g., 16" },
        { name: "base_clock", label: "Base Clock Speed (GHz)", placeholder: "e.g., 4.5" },
        { name: "boost_clock", label: "Max Boost Clock (GHz)", placeholder: "e.g., 5.4" },
        { name: "l2_cache", label: "L2 Cache (MB)", placeholder: "e.g., 8" },
        { name: "l3_cache", label: "L3 Cache (MB)", placeholder: "e.g., 32" },
        { name: "tdp", label: "TDP (Watts)", placeholder: "e.g., 105W" },
        { name: "socket", label: "Socket Type", placeholder: "e.g., AM5" },
        { name: "memory_support", label: "Memory Support", placeholder: "e.g., DDR5-5200" },
        { name: "pcie_support", label: "PCIe Support", placeholder: "e.g., 5.0" },
        { name: "integrated_graphics", label: "Integrated Graphics", placeholder: "e.g., Radeon Graphics (2 cores, 2200 MHz)" },
      ],
      gpu: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., NVIDIA GeForce RTX 4070" },
        { name: "vram", label: "VRAM Size (GB)", placeholder: "e.g., 12" },
        { name: "coreClock", label: "Core Clock Speed (MHz)", placeholder: "e.g., 1920" },
        { name: "boostClock", label: "Boost Clock Speed (MHz)", placeholder: "e.g., 2475" },
        { name: "cudaCores", label: "CUDA Cores / Stream Processors", placeholder: "e.g., 5888" },
        { name: "memoryType", label: "Memory Type", placeholder: "e.g., GDDR6X" },
        { name: "tdp", label: "TDP (Watts)", placeholder: "e.g., 200W" },
        { name: "interface", label: "Interface", placeholder: "e.g., PCIe 4.0 x16" },
        { name: "length", label: "Length (mm)", placeholder: "e.g., 304" },
        { name: "height", label: "Height (mm)", placeholder: "e.g., 112" },
        { name: "width", label: "Width (mm)", placeholder: "e.g., 40" },
        { name: "outputs", label: "Outputs", placeholder: "e.g., 3x DisplayPort 1.4a, 1x HDMI 2.1" },
      ],
      motherboard: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., ASUS ROG Strix B650-A" },
        { name: "chipset", label: "Chipset", placeholder: "e.g., AMD B650" },
        { name: "socket", label: "Socket Type", placeholder: "e.g., AM5, LGA 1700" },
        { name: "ramType", label: "Supported RAM Type", placeholder: "e.g., DDR5" },
        { name: "ramSlots", label: "RAM Slots", placeholder: "e.g., 4" },
        { name: "maxRamCapacity", label: "Max RAM Capacity", placeholder: "e.g., 128GB" },
        { name: "pciSlots", label: "PCIe Slots", placeholder: "e.g., 1x PCIe 5.0 x16, 2x PCIe 4.0 x1" },
        { name: "m2Slots", label: "M.2 Slots", placeholder: "e.g., 3x M.2 PCIe 4.0" },
        { name: "sataInterface", label: "SATA Ports", placeholder: "e.g., 4x SATA 6Gb/s" },
        { name: "usbPorts", label: "USB Ports", placeholder: "e.g., 2x USB 3.2 Gen 2, 4x USB 3.2 Gen 1" },
        { name: "networking", label: "Networking", placeholder: "e.g., 2.5G Ethernet, Wi-Fi 6E" },
        { name: "formFactor", label: "Form Factor", placeholder: "e.g., ATX, Micro-ATX, Mini-ITX" },
      ],
      ram: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Corsair Vengeance RGB DDR5" },
        { name: "type", label: "Type", placeholder: "e.g., DDR4, DDR5" },
        { name: "speed", label: "Speed (MHz)", placeholder: "e.g., 6000" },
        { name: "capacityPerStick", label: "Capacity per Stick (GB)", placeholder: "e.g., 16" },
        { name: "totalCapacity", label: "Total Capacity (GB)", placeholder: "e.g., 32" },
        { name: "casLatency", label: "CAS Latency", placeholder: "e.g., CL36" },
        { name: "voltage", label: "Voltage", placeholder: "e.g., 1.35V" },
        { name: "modules", label: "Number of Modules in Kit", placeholder: "e.g., 2x16GB" },
      ],
      ssd: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Samsung 990 PRO" },
        { name: "type", label: "Type", placeholder: "e.g., SSD, NVMe" },
        { name: "capacity", label: "Capacity", placeholder: "e.g., 1TB, 2TB" },
        { name: "interface", label: "Interface", placeholder: "e.g., PCIe 4.0 x4 NVMe, SATA III" },
        { name: "readSpeed", label: "Read Speed (MB/s)", placeholder: "e.g., 7450" },
        { name: "writeSpeed", label: "Write Speed (MB/s)", placeholder: "e.g., 6900" },
        { name: "formFactor", label: "Form Factor", placeholder: "e.g., M.2 2280, 2.5\"" },
      ],
      hdd: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Seagate BarraCuda" },
        { name: "type", label: "Type", placeholder: "e.g., HDD" },
        { name: "capacity", label: "Capacity", placeholder: "e.g., 2TB, 4TB" },
        { name: "interface", label: "Interface", placeholder: "e.g., SATA III" },
        { name: "readSpeed", label: "Read Speed (MB/s)", placeholder: "e.g., 220" },
        { name: "writeSpeed", label: "Write Speed (MB/s)", placeholder: "e.g., 220" },
        { name: "formFactor", label: "Form Factor", placeholder: "e.g., 3.5\"" },
        { name: "rpm", label: "RPM", placeholder: "e.g., 7200" },
      ],
      psu: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Corsair RM850x" },
        { name: "wattage", label: "Wattage", placeholder: "e.g., 850W" },
        { name: "efficiency", label: "Efficiency Rating", placeholder: "e.g., 80 Plus Gold" },
        { name: "modular", label: "Modular Type", placeholder: "e.g., Fully Modular, Semi-Modular" },
        { name: "formFactor", label: "Form Factor", placeholder: "e.g., ATX, SFX" },
        { name: "protections", label: "Protections", placeholder: "e.g., OVP, OCP, SCP, OPP, OTP" },
      ],
      case: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., NZXT H510 Flow" },
        { name: "supportedFormFactors", label: "Supported Form Factors", placeholder: "e.g., ATX, Micro-ATX, Mini-ITX" },
        { name: "driveBays", label: "Drive Bays", placeholder: "e.g., 2x 3.5\", 2x 2.5\"" },
        { name: "cooling", label: "Cooling Options", placeholder: "e.g., 2x 140mm front, 1x 120mm rear" },
        { name: "height", label: "Height (mm)", placeholder: "e.g., 460" },
        { name: "width", label: "Width (mm)", placeholder: "e.g., 210" },
        { name: "depth", label: "Depth (mm)", placeholder: "e.g., 428" },
        { name: "frontIO", label: "Front Panel I/O", placeholder: "e.g., 1x USB-C, 2x USB 3.0, Audio" },
      ],
      cooler: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Noctua NH-D15" },
        { name: "type", label: "Type", placeholder: "e.g., Air Cooler, AIO Liquid Cooler" },
        { name: "supportedSockets", label: "Supported Socket Types", placeholder: "e.g., AM4, AM5, LGA1700" },
        { name: "tdpRange", label: "Supported TDP Range (Watts)", placeholder: "e.g., Up to 220W" },
        { name: "fanSize", label: "Fan Size", placeholder: "e.g., 2x 140mm" },
        { name: "fanSpeed", label: "Fan Speed (RPM)", placeholder: "e.g., 300-1500" },
        { name: "noiseLevel", label: "Noise Level (dBA)", placeholder: "e.g., 24.6" },
        { name: "radiatorSize", label: "Radiator Size (for AIO)", placeholder: "e.g., 240mm, 360mm" },
      ],
      networkcard: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Intel AX210" },
        { name: "interface", label: "Interface Type", placeholder: "e.g., PCIe x1, M.2" },
        { name: "speed", label: "Speed / Bandwidth", placeholder: "e.g., Wi-Fi 6E, 2.5Gbps Ethernet" },
        { name: "standards", label: "Supported Standards", placeholder: "e.g., 802.11ax, Bluetooth 5.2" },
      ],
      soundcard: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Creative Sound Blaster AE-9" },
        { name: "interface", label: "Interface Type", placeholder: "e.g., PCIe x1" },
        { name: "channels", label: "Audio Channels", placeholder: "e.g., 7.1" },
        { name: "snr", label: "SNR (dB)", placeholder: "e.g., 129" },
      ],
      monitor: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., ASUS ROG Swift PG279QM" },
        { name: "screenSize", label: "Screen Size (inches)", placeholder: "e.g., 27" },
        { name: "panelType", label: "Panel Type", placeholder: "e.g., IPS, TN, VA, OLED" },
        { name: "resolution", label: "Resolution", placeholder: "e.g., 1920x1080, 2560x1440, 3840x2160" },
        { name: "refreshRate", label: "Refresh Rate (Hz)", placeholder: "e.g., 144, 165, 240" },
        { name: "responseTime", label: "Response Time (ms)", placeholder: "e.g., 1, 4, 5" },
        { name: "aspectRatio", label: "Aspect Ratio", placeholder: "e.g., 16:9, 21:9, 32:9" },
        { name: "brightness", label: "Brightness (nits)", placeholder: "e.g., 350, 400, 600" },
        { name: "contrastRatio", label: "Contrast Ratio", placeholder: "e.g., 1000:1, 3000:1" },
        { name: "colorGamut", label: "Color Gamut", placeholder: "e.g., 99% sRGB, 95% DCI-P3" },
        { name: "inputs", label: "Inputs", placeholder: "e.g., 2x HDMI 2.1, 1x DisplayPort 1.4, 1x USB-C" },
        { name: "features", label: "Features", placeholder: "e.g., G-Sync, FreeSync, HDR400, HDR600" },
        { name: "vesaMount", label: "VESA Mount", placeholder: "e.g., 100x100mm, 75x75mm" },
        { name: "curved", label: "Curved or Flat", placeholder: "e.g., Flat, 1800R, 1000R" },
      ],
      keyboard: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Corsair K95 RGB Platinum" },
        { name: "keyboardType", label: "Keyboard Type", placeholder: "e.g., Mechanical, Membrane, Hybrid" },
        { name: "switchType", label: "Switch Type", placeholder: "e.g., Cherry MX Red, Blue, Brown, Optical" },
        { name: "keyRollover", label: "Key Rollover & Anti-Ghosting", placeholder: "e.g., N-Key Rollover, 6-Key Rollover" },
        { name: "layout", label: "Layout", placeholder: "e.g., ANSI, ISO, Full-Size, TKL, 60%" },
        { name: "backlighting", label: "Backlighting", placeholder: "e.g., RGB Per-Key, Single Color, None" },
        { name: "connectivity", label: "Connectivity", placeholder: "e.g., Wired USB, Bluetooth 5.0, 2.4GHz Wireless" },
        { name: "keycapMaterial", label: "Keycap Material", placeholder: "e.g., PBT Double-Shot, ABS" },
        { name: "additionalFeatures", label: "Additional Features", placeholder: "e.g., Dedicated Media Keys, Macro Keys, Wrist Rest, Hot-Swappable" },
      ],
      mouse: [
        { name: "modelName", label: "Model Name", placeholder: "e.g., Logitech G Pro X Superlight" },
        { name: "sensorType", label: "Sensor Type", placeholder: "e.g., Optical, Laser, PixArt PMW3366" },
        { name: "dpiRange", label: "DPI Range", placeholder: "e.g., 100-25600, 400-16000" },
        { name: "pollingRate", label: "Polling Rate (Hz)", placeholder: "e.g., 125, 500, 1000" },
        { name: "numberOfButtons", label: "Number of Buttons", placeholder: "e.g., 5, 6, 8, 11" },
        { name: "connectivity", label: "Connectivity", placeholder: "e.g., Wired USB, Wireless 2.4GHz, Bluetooth" },
        { name: "weight", label: "Weight (grams)", placeholder: "e.g., 63g, 80g, 120g" },
        { name: "ergonomics", label: "Ergonomics", placeholder: "e.g., Right-handed, Left-handed, Ambidextrous" },
        { name: "additionalFeatures", label: "Additional Features", placeholder: "e.g., RGB Lighting, Adjustable Weight, On-board Memory, DPI Switch" },
      ],
      default: [
        { name: "modelName", label: "Model Name", placeholder: "Enter model name" },
        { name: "specifications", label: "Specifications", placeholder: "Enter specifications", multiline: true, rows: 5 },
      ],
    };

    // Enhanced Debug Logging
    console.log("========== CATEGORY DEBUG ==========");
    console.log("Component:", component);
    console.log("Original category:", component.category);
    console.log("Component name:", component.name);
    console.log("Component id:", component.id);
    console.log("Normalized category:", normalizedCategory);
    console.log("Found in fieldConfigs:", fieldConfigs[normalizedCategory] ? "✅ YES" : "❌ NO (using default)");
    console.log("Number of fields:", (fieldConfigs[normalizedCategory] || fieldConfigs.default).length);
    console.log("===================================");

    return fieldConfigs[normalizedCategory] || fieldConfigs.default;
  };

  if (!selectedComponents || selectedComponents.length === 0) {
    return (
      <Box sx={{ width: "100%", mb: 3, p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Please select a component to add specifications
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Component Specifications
      </Typography>
      
      <Stack spacing={2}>
        {selectedComponents.map((component) => {
          const fields = getSpecificationFields(component);
          const componentSpecs = specifications[component.id] || {};

          return (
            <Accordion
              key={component.id}
              defaultExpanded={isEditMode || selectedComponents.length === 1} // Auto-expand in edit mode or if only one component
              sx={{
                border: "1px solid #e0e0e0",
                boxShadow: "none",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: "#fafafa",
                  borderRadius: 1,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {component.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {component.category || "Custom Component"}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  {fields.map((field) => (
                    <TextField
                      key={field.name}
                      label={field.label}
                      placeholder={field.placeholder}
                      fullWidth
                      size="small"
                      multiline={field.multiline}
                      minRows={field.multiline ? (field.rows || 3) : 1}
                      value={componentSpecs[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(component.id, field.name, e.target.value)
                      }
                      InputProps={{
                        style: field.name === 'specifications' ? {
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit'
                        } : {}
                      }}
                      inputProps={{
                        style: field.name === 'specifications' ? {
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit'
                        } : {}
                      }}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ComponentSpecifications;