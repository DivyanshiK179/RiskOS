import { useUIStore } from "../store/uiStore";

export const DICT: Record<string, Record<"en" | "hi", string>> = {
  // ── GOI Top Strip & Accessibility
  "goi_title": { en: "Government of India", hi: "भारत सरकार" },
  "ndma_sub": { en: "National Disaster Management Authority | SDMA Uttarakhand", hi: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण | राज्य आपदा प्रबंधन प्राधिकरण, उत्तराखंड" },
  "skip_content": { en: "Skip to Main Content", hi: "मुख्य सामग्री पर जाएं" },
  "screen_reader": { en: "Screen Reader Access", hi: "स्क्रीन रीडर सहायता" },
  "text_size": { en: "Text Size", hi: "अक्षर आकार" },
  "theme_toggle": { en: "Toggle Theme", hi: "थीम बदलें" },
  "light_mode": { en: "Light Mode", hi: "हल्का मोड" },
  "dark_mode": { en: "Dark Mode", hi: "गहरा मोड" },
  "lang_en": { en: "English", hi: "English" },
  "lang_hi": { en: "हिन्दी", hi: "हिन्दी" },

  // ── Primary Brand Header
  "portal_title": { en: "RiskOS", hi: "जोखिम ओएस" },
  "portal_tagline": { en: "National Disaster Risk & Relocation Decision Support System (GIS-DSS)", hi: "राष्ट्रीय आपदा जोखिम एवं पुनर्वास निर्णय समर्थन प्रणाली (GIS-DSS)" },
  "portal_sub_dept": { en: "National Disaster Risk & Relocation Decision Support System (GIS-DSS)", hi: "राष्ट्रीय आपदा जोखिम एवं पुनर्वास निर्णय समर्थन प्रणाली (GIS-DSS)" },
  "official_tag": { en: "Official Portal - SDMA / NDMA", hi: "आधिकारिक पोर्टल - राज्य/राष्ट्रीय आपदा प्रबंधन" },
  "authority_badge": { en: "GOVERNMENT OF INDIA • STATUTORY SDMA PORTAL", hi: "भारत सरकार • वैधानिक राज्य आपदा प्रबंधन प्राधिकरण" },
  "officer_role": { en: "State Officer - Uttarakhand", hi: "राज्य अधिकारी - उत्तराखंड" },
  "sign_out": { en: "Sign Out", hi: "लॉग आउट" },
  "sign_out_confirm_title": { en: "Confirm Sign Out", hi: "लॉग आउट की पुष्टि करें" },
  "sign_out_confirm_desc": { en: "Are you sure you want to exit the official RiskOS command session? Any unsaved live operational drafts may be lost.", hi: "क्या आप वाकई आधिकारिक जोखिम ओएस कमांड सत्र समाप्त करना चाहते हैं? कोई भी अधूरा कार्य खो सकता है।" },
  "cancel": { en: "Cancel", hi: "रद्द करें" },
  "confirm_sign_out_btn": { en: "Yes, Sign Out", hi: "हाँ, लॉग आउट करें" },
  "command_centre": { en: "Command Centre", hi: "कमांड सेंटर" },
  "official_login": { en: "Official Login", hi: "अधिकारी लॉगिन" },
  "dev_console": { en: "Dev Console", hi: "सिस्टम कंसोल" },

  // ── GIS Panel Toggles & Shortcuts
  "zen_mode_toggle": { en: "Full Map / Zen Mode (Z)", hi: "पूर्ण मानचित्र / ज़ेन मोड (Z)" },
  "restore_panels": { en: "Restore Panels", hi: "पैनल पुनः खोलें" },
  "settlement_analytics": { en: "Settlement Analytics", hi: "बस्ती विश्लेषण" },
  "toggle_sidebar": { en: "Toggle Navigation ([)", hi: "नेविगेशन टॉगल ([)" },
  "toggle_inspector": { en: "Toggle Analytics (])", hi: "विश्लेषण टॉगल (])" },
  "toggle_layers_shortcut": { en: "Layers & Legend (L)", hi: "परतें एवं लेजेंड (L)" },

  // ── GIS Controls & Popups
  "basemap_title": { en: "Basemap Provider", hi: "बेस-मानचित्र प्रदाता" },
  "basemap_satellite": { en: "Satellite Hybrid", hi: "उपग्रह संकर" },
  "basemap_street": { en: "Street / Cadastral", hi: "सड़क / कैडस्ट्रल" },
  "basemap_topo": { en: "Topographic", hi: "स्थलाकृतिक" },
  "calc_evac_route": { en: "Calculate Evacuation Route to Safe Site", hi: "सुरक्षित स्थल हेतु निकासी मार्ग ज्ञात करें" },
  "routing_in_progress": { en: "Calculating Route...", hi: "मार्ग गणना जारी..." },
  "measure_tool": { en: "Measure Distance", hi: "दूरी मापें" },
  "measure_active": { en: "Click map to measure distance (double-click to finish)", hi: "मानचित्र पर क्लिक कर दूरी मापें" },
  "clear_measure": { en: "Clear Measurement", hi: "माप हटाएं" },
  "lgd_code": { en: "LGD Code", hi: "एलजीडी कोड" },
  "nearest_safe_site": { en: "Nearest Safe Site", hi: "निकटतम सुरक्षित स्थल" },
  "route_distance": { en: "Route Distance", hi: "मार्ग दूरी" },
  "route_eta": { en: "Estimated Travel Time", hi: "अनुमानित यात्रा समय" },
  "hazard_score": { en: "Hazard Score", hi: "जोखिम स्कोर" },
  "vulnerability_score": { en: "Vulnerability Score", hi: "भेद्यता स्कोर" },

  // ── Navigation Items
  "nav_risk_map": { en: "Risk Assessment Map", hi: "जोखिम मूल्यांकन मानचित्र" },
  "nav_relocation_plans": { en: "Relocation Action Plans", hi: "पुनर्वास कार्य योजनाएं" },
  "nav_safe_sites": { en: "Safe Sites Inventory", hi: "सुरक्षित आश्रय स्थल" },
  "nav_alerts": { en: "Emergency Alerts", hi: "आपातकालीन अलर्ट" },
  "nav_analytics": { en: "Analytical Overview", hi: "विश्लेषणात्मक अवलोकन" },
  "nav_simulation": { en: "Disaster Simulation", hi: "आपदा सिमुलेशन" },
  "nav_audit_trail": { en: "Audit Trail & Logs", hi: "ऑडिट ट्रेल एवं लॉग्स" },
  "nav_collapse": { en: "Collapse Menu", hi: "मेन्यू संक्षिप्त करें" },
  "nav_expand": { en: "Expand Menu", hi: "मेन्यू विस्तार करें" },

  // ── Filter Controls
  "all_districts": { en: "All Districts", hi: "सभी ज़िले" },
  "all_risk_levels": { en: "All Risk Levels", hi: "सभी जोखिम स्तर" },
  "search_placeholder": { en: "Search settlement / tehsil / pin...", hi: "बस्ती / तहसील / पिन कोड खोजें..." },
  "filter_district_label": { en: "District Filter", hi: "ज़िला चयन" },
  "filter_risk_label": { en: "Hazard Level Filter", hi: "जोखिम स्तर चयन" },

  // ── Severity & Risk Levels
  "red_zone": { en: "Red Zone (Extreme)", hi: "लाल क्षेत्र (अति गंभीर)" },
  "high_risk": { en: "High Risk", hi: "उच्च जोखिम" },
  "moderate_risk": { en: "Moderate Watch", hi: "मध्यम जोखिम (निगरानी)" },
  "safe_zone": { en: "Safe Zone", hi: "सुरक्षित क्षेत्र" },

  // ── KPI Summary Cards
  "kpi_total_settlements": { en: "Total Settlements", hi: "कुल बस्तियां" },
  "kpi_red_zones": { en: "Critical Red Zones", hi: "अति-संवेदनशील लाल क्षेत्र" },
  "kpi_pop_risk": { en: "Population At Risk", hi: "खतरे में अनुमानित जनसंख्या" },
  "kpi_safe_capacity": { en: "Safe Shelter Capacity", hi: "सुरक्षित आश्रय क्षमता" },
  "kpi_active_plans": { en: "Active Relocation Plans", hi: "सक्रिय पुनर्वास योजनाएं" },
  "kpi_critical_alerts": { en: "Active Critical Alerts", hi: "सक्रिय गंभीर अलर्ट" },
  "kpi_trend_stable": { en: "100% Ingested Data", hi: "100% वास्तविक डेटा" },
  "kpi_action_needed": { en: "Immediate Action Required", hi: "त्वरित कार्रवाई आवश्यक" },
  "immediate_action": { en: "Immediate Action Required", hi: "त्वरित कार्रवाई आवश्यक" },
  "high_surveillance": { en: "High Surveillance", hi: "सघन निगरानी आवश्यक" },
  "estimated_exposure": { en: "Estimated Exposure", hi: "अनुमानित प्रभावित आबादी" },
  "visible_in_filter": { en: "visible in filter", hi: "फ़िल्टर में दृश्यमान" },
  "residents": { en: "residents", hi: "निवासी" },
  "priority_evacuation": { en: "Priority Evacuation", hi: "प्राथमिकता निकासी" },

  // ── Map Layer & Legend Controls
  "layers_header": { en: "Map Layers & Overlays", hi: "मानचित्र परतें एवं ओवरले" },
  "core_geo_entities": { en: "Core Geo-Entities", hi: "मुख्य भू-स्थानिक इकाइयां" },
  "layer_settlements": { en: "At-Risk Settlements", hi: "जोखिम वाली बस्तियां" },
  "layer_safesites": { en: "Safe Relocation Shelters", hi: "सुरक्षित पुनर्वास आश्रय" },
  "hazard_layers_grp": { en: "Hazard Susceptibility", hi: "आपदा संवेदनशीलता परतें" },
  "layer_landslide": { en: "Landslide Susceptibility", hi: "भूस्खलन संवेदनशीलता" },
  "layer_flood": { en: "Flash Flood Inundation", hi: "अचानक बाढ़ जलभराव" },
  "layer_cloudburst": { en: "Cloudburst Trajectory", hi: "बादल फटने का क्षेत्र" },
  "infra_layers_grp": { en: "Infrastructure & Logistics", hi: "ढांचागत एवं रसद परतें" },
  "layer_evac_routes": { en: "Evacuation Corridors", hi: "निकासी गलियारे (सड़क)" },
  "layer_hospitals": { en: "Emergency Medical Units", hi: "आपातकालीन चिकित्सा केंद्र" },
  "admin_layers_grp": { en: "Administrative Boundaries", hi: "प्रशासनिक सीमाएं" },
  "layer_district_boundary": { en: "District Boundaries", hi: "ज़िला सीमाएं" },
  "legend_title": { en: "Official Hazard Classification", hi: "आधिकारिक आपदा वर्गीकरण" },

  // ── Public Banner & Detail
  "active_advisory": { en: "Active Advisory", hi: "सक्रिय चेतावनी" },
  "critical_alert": { en: "critical alert", hi: "गंभीर अलर्ट" },
  "critical_alerts": { en: "critical alerts", hi: "गंभीर अलर्ट" },
  "public_hazard_map": { en: "Public Hazard Map", hi: "सार्वजनिक आपदा मानचित्र" },
  "loading_habitations": { en: "Loading geospatial habitations...", hi: "भू-स्थानिक बस्तियों का डेटा लोड हो रहा है..." },
  "no_settlements_match": { en: "No settlements match your filters.", hi: "आपके फ़िल्टर से कोई बस्ती मेल नहीं खाती।" },
  "showing_top_200": { en: "Showing top 200 habitations. Use search to refine.", hi: "शीर्ष 200 बस्तियां प्रदर्शित। खोजने हेतु सर्च का उपयोग करें।" },
  "open_risk_profile": { en: "Open Risk Profile", hi: "जोखिम प्रोफ़ाइल देखें" },
  "population": { en: "Population", hi: "जनसंख्या" },
  "district": { en: "District", hi: "ज़िला" },
  "status": { en: "Status", hi: "स्थिति" },
  "actions": { en: "Actions", hi: "कार्रवाई" },
  "new_plan_btn": { en: "New Relocation Plan", hi: "नई पुनर्वास योजना" },
  "broadcast_alert_btn": { en: "Broadcast Alert", hi: "अलर्ट जारी करें" },
  "simulation_title": { en: "Predictive Disaster Simulation", hi: "पूर्वानुमान आपदा सिमुलेशन" },
  "simulation_desc": { en: "Trigger multi-hazard impact radius to compute instantly affected habitations and auto-route to optimal verified shelters.", hi: "प्रभावित बस्तियों की त्वरित गणना एवं निकटतम सुरक्षित आश्रयों हेतु स्वतः मार्ग निर्धारण।" },

  // ── Detail Panel & Risk Breakdown
  "Settlement": { en: "Settlement", hi: "बस्ती" },
  "Safe site": { en: "Safe site", hi: "सुरक्षित आश्रय" },
  "Priority": { en: "Priority", hi: "प्राथमिकता" },
  "Created by": { en: "Created by", hi: "निर्माता" },
  "Action": { en: "Action", hi: "कार्रवाई" },
  "Approve": { en: "Approve", hi: "स्वीकृत करें" },
  "Activate": { en: "Activate", hi: "सक्रिय करें" },
  "Mark complete": { en: "Mark complete", hi: "पूर्ण चिह्नित करें" },
  "Issue alert": { en: "Issue alert", hi: "अलर्ट जारी करें" },
  "Plan relocation": { en: "Plan relocation", hi: "पुनर्वास योजना बनाएं" },
  "Risk Scores": { en: "Risk Scores", hi: "जोखिम स्कोर" },
  "Hazard score": { en: "Hazard score", hi: "आपदा स्कोर" },
  "Vulnerability score": { en: "Vulnerability score", hi: "भेद्यता स्कोर" },
  "out of 100": { en: "out of 100", hi: "100 में से" },
  "Hazard breakdown": { en: "Hazard breakdown", hi: "आपदा संवेदनशीलता विवरण" },
  "Vulnerability breakdown": { en: "Vulnerability breakdown", hi: "भेद्यता कारक विवरण" },
  "Environmental indicators": { en: "Environmental indicators", hi: "पर्यावरणीय एवं संरचनात्मक संकेतक" },
  "Seismic zone": { en: "Seismic zone", hi: "भूकंपीय क्षेत्र" },
  "Elevation": { en: "Elevation", hi: "ऊंचाई" },
  "Annual rainfall": { en: "Annual rainfall", hi: "वार्षिक वर्षा" },
  "Extreme rain days": { en: "Extreme rain days", hi: "अत्यधिक वर्षा दिवस" },
  "River distance": { en: "River distance", hi: "नदी से दूरी" },
  "Dilapidated housing": { en: "Dilapidated housing", hi: "जर्जर मकान" },
  "Kutcha roof/wall": { en: "Kutcha roof/wall", hi: "कच्ची छत/दीवार" },
  "No toilet access": { en: "No toilet access", hi: "शौचालय विहीन" },
  "No drainage": { en: "No drainage", hi: "जल निकासी विहीन" },
  "Matched safe sites": { en: "Matched safe sites", hi: "उपयुक्त सुरक्षित स्थल" },
  "found": { en: "found", hi: "मिले" },
  "Calculating matches...": { en: "Calculating matches...", hi: "उपयुक्त स्थलों की गणना जारी..." },
  "No safe sites found within range.": { en: "No safe sites found within range.", hi: "दायरे में कोई सुरक्षित स्थल नहीं मिला।" },
  "match": { en: "match", hi: "अनुकूलता" },
  "Capacity:": { en: "Capacity:", hi: "क्षमता:" },
  "Full accommodation": { en: "Full accommodation", hi: "पूर्ण आवास संभव" },
  "Partial capacity only": { en: "Partial capacity only", hi: "आंशिक क्षमता मात्र" },
  "Use this site for relocation plan →": { en: "Use this site for relocation plan →", hi: "पुनर्वास योजना हेतु इस स्थल का चयन करें →" },
  "Loading risk profile...": { en: "Loading risk profile...", hi: "जोखिम प्रोफ़ाइल लोड हो रहा है..." },
  "Failed to load risk profile.": { en: "Failed to load risk profile.", hi: "जोखिम प्रोफ़ाइल लोड करने में विफल।" },
  "Loading...": { en: "Loading...", hi: "लोड हो रहा है..." },
  "Unknown": { en: "Unknown", hi: "अज्ञात" },

  // ── Relocation Plans Tab
  "Relocation Plans": { en: "Relocation Plans", hi: "पुनर्वास कार्य योजनाएं" },
  "Manage evacuation and rehabilitation operations": { en: "Manage evacuation and rehabilitation operations", hi: "निकासी एवं पुनर्वास अभियानों का प्रबंधन" },
  "New plan": { en: "New plan", hi: "नई योजना" },
  "Loading plans...": { en: "Loading plans...", hi: "योजनाएं लोड हो रही हैं..." },
  "No relocation plans yet": { en: "No relocation plans yet", hi: "अभी कोई पुनर्वास योजना नहीं है" },
  "Create the first plan to start tracking evacuations": { en: "Create the first plan to start tracking evacuations", hi: "निकासी ट्रैक करने हेतु पहली योजना बनाएं" },
  "Create first plan": { en: "Create first plan", hi: "पहली योजना बनाएं" },
  "PROPOSED": { en: "PROPOSED", hi: "प्रस्तावित" },
  "APPROVED": { en: "APPROVED", hi: "स्वीकृत" },
  "IN_PROGRESS": { en: "IN_PROGRESS", hi: "प्रगति पर" },
  "COMPLETED": { en: "COMPLETED", hi: "पूर्ण" },
  "CANCELLED": { en: "CANCELLED", hi: "रद्द" },
  "ROUTINE": { en: "ROUTINE", hi: "नियमित" },
  "URGENT": { en: "URGENT", hi: "अति आवश्यक" },
  "IMMEDIATE": { en: "IMMEDIATE", hi: "तत्काल" },

  // ── Safe Sites Tab
  "Safe Relocation Sites": { en: "Safe Relocation Sites", hi: "सुरक्षित पुनर्वास स्थल" },
  "Verified shelter capacity": { en: "Verified shelter capacity", hi: "सत्यापित आश्रय क्षमता" },
  "places available": { en: "places available", hi: "स्थान उपलब्ध" },
  "Capacity used": { en: "Capacity used", hi: "प्रयुक्त क्षमता" },
  "Active": { en: "Active", hi: "सक्रिय" },
  "Area": { en: "Area", hi: "क्षेत्रफल" },
  "Road access": { en: "Road access", hi: "सड़क संपर्क" },
  "Water supply": { en: "Water supply", hi: "जल आपूर्ति" },
  "Yes": { en: "Yes", hi: "हाँ" },
  "No": { en: "No", hi: "नहीं" },

  // ── Early Warning Alerts Tab
  "Early Warning Alerts": { en: "Early Warning Alerts", hi: "प्रारंभिक चेतावनी एवं अलर्ट" },
  "Broadcast emergency advisories to field teams and the public map": { en: "Broadcast emergency advisories to field teams and the public map", hi: "मैदानी दलों एवं जनसामान्य को आपातकालीन परामर्श जारी करें" },
  "New alert": { en: "New alert", hi: "नया अलर्ट" },
  "No active alerts": { en: "No active alerts", hi: "कोई सक्रिय अलर्ट नहीं है" },
  "Delete alert": { en: "Delete alert", hi: "अलर्ट हटाएं" },
  "By": { en: "By", hi: "द्वारा" },
  "CRITICAL": { en: "CRITICAL", hi: "गंभीर" },
  "HIGH": { en: "HIGH", hi: "उच्च" },
  "MODERATE": { en: "MODERATE", hi: "मध्यम" },
  "LOW": { en: "LOW", hi: "निम्न" },

  // ── Disaster Simulation Tab
  "Disaster Simulation": { en: "Disaster Simulation", hi: "आपदा सिमुलेशन" },
  "Click anywhere on the map to set the disaster epicenter.": { en: "Click anywhere on the map to set the disaster epicenter.", hi: "आपदा केंद्र बिंदु तय करने हेतु मानचित्र पर कहीं भी क्लिक करें।" },
  "Disaster Type": { en: "Disaster Type", hi: "आपदा प्रकार" },
  "Cloudburst": { en: "Cloudburst", hi: "बादल फटना" },
  "Earthquake": { en: "Earthquake", hi: "भूकंप" },
  "Flood": { en: "Flood", hi: "बाढ़" },
  "Landslide": { en: "Landslide", hi: "भूस्खलन" },
  "Radius (km):": { en: "Radius (km):", hi: "प्रभाव त्रिज्या (किमी):" },
  "Epicenter Set:": { en: "Epicenter Set:", hi: "केंद्र बिंदु निर्धारित:" },
  "Lat:": { en: "Lat:", hi: "अक्षांश:" },
  "Lon:": { en: "Lon:", hi: "देशांतर:" },
  "Run Simulation": { en: "Run Simulation", hi: "सिमुलेशन प्रारंभ करें" },
  "Simulating...": { en: "Simulating...", hi: "गणना जारी..." },
  "Simulation Results": { en: "Simulation Results", hi: "सिमुलेशन परिणाम" },
  "Expected Impact": { en: "Expected Impact", hi: "संभावित प्रभाव" },
  "Affected Population:": { en: "Affected Population:", hi: "प्रभावित आबादी:" },
  "Affected Settlements:": { en: "Affected Settlements:", hi: "प्रभावित बस्तियां:" },
  "High/Red Risk Zones:": { en: "High/Red Risk Zones:", hi: "उच्च/लाल जोखिम क्षेत्र:" },
  "Utilized Safe Sites": { en: "Utilized Safe Sites", hi: "उपयोग किए गए सुरक्षित स्थल" },

  // ── Legend & Layers
  "layers": { en: "Layers", hi: "परतें" },
  "legend": { en: "Legend", hi: "संकेतक" },
  "legend_desc": { en: "Standardized Emergency Disaster Risk Classification (GIGW/NDMA):", hi: "मानकीकृत आपातकालीन आपदा जोखिम वर्गीकरण (GIGW/NDMA):" },
  "red_zone_legend": { en: "Score > 70 • Immediate Relocation", hi: "स्कोर > 70 • त्वरित पुनर्वास" },
  "high_risk_legend": { en: "Score 50-70 • High Vulnerability", hi: "स्कोर 50-70 • उच्च संवेदनशीलता" },
  "moderate_risk_legend": { en: "Score 30-50 • Active Surveillance", hi: "स्कोर 30-50 • सक्रिय निगरानी" },
  "safe_zone_legend": { en: "Score < 30 • Designated Shelter", hi: "स्कोर < 30 • सुरक्षित आश्रय" },

  // ── Modals & Misc
  "Initiate Relocation Plan": { en: "Initiate Relocation Plan", hi: "पुनर्वास योजना प्रारंभ करें" },
  "Target Habitation": { en: "Target Habitation", hi: "लक्षित बस्ती" },
  "Assigned Safe Site": { en: "Assigned Safe Site", hi: "आवंटित सुरक्षित स्थल" },
  "Population to Relocate": { en: "Population to Relocate", hi: "स्थानांतरित की जाने वाली जनसंख्या" },
  "Priority Level": { en: "Priority Level", hi: "प्राथमिकता स्तर" },
  "Target Evacuation Date": { en: "Target Evacuation Date", hi: "लक्ष्य निकासी तिथि" },
  "Operational Notes": { en: "Operational Notes", hi: "परिचालन टिप्पणियां" },
  "Create Relocation Plan": { en: "Create Relocation Plan", hi: "पुनर्वास योजना बनाएं" },
  "Creating...": { en: "Creating...", hi: "योजना बनाई जा रही है..." },
  "Broadcast Early Warning Alert": { en: "Broadcast Early Warning Alert", hi: "प्रारंभिक चेतावनी अलर्ट जारी करें" },
  "Alert Severity": { en: "Alert Severity", hi: "अलर्ट गंभीरता" },
  "Alert Headline": { en: "Alert Headline", hi: "अलर्ट शीर्षक" },
  "Detailed Emergency Message": { en: "Detailed Emergency Message", hi: "विस्तृत आपातकालीन संदेश" },
  "Affected Habitation (Optional)": { en: "Affected Habitation (Optional)", hi: "प्रभावित बस्ती (वैकल्पिक)" },
  "None / General Alert": { en: "None / General Alert", hi: "कोई नहीं / सामान्य अलर्ट" },
  "Broadcast Alert": { en: "Broadcast Alert", hi: "अलर्ट प्रसारित करें" },
  "Broadcasting...": { en: "Broadcasting...", hi: "प्रसारित हो रहा है..." },

  // ── Districts (Uttarakhand)
  "Almora": { en: "Almora", hi: "अल्मोड़ा" },
  "Bageshwar": { en: "Bageshwar", hi: "बागेश्वर" },
  "Chamoli": { en: "Chamoli", hi: "चमोली" },
  "Champawat": { en: "Champawat", hi: "चंपावत" },
  "Dehradun": { en: "Dehradun", hi: "देहरादून" },
  "Haridwar": { en: "Haridwar", hi: "हरिद्वार" },
  "Nainital": { en: "Nainital", hi: "नैनीताल" },
  "Pauri Garhwal": { en: "Pauri Garhwal", hi: "पौड़ी गढ़वाल" },
  "Pithoragarh": { en: "Pithoragarh", hi: "पिथौरागढ़" },
  "Rudraprayag": { en: "Rudraprayag", hi: "रुद्रप्रयाग" },
  "Tehri Garhwal": { en: "Tehri Garhwal", hi: "टिहरी गढ़वाल" },
  "Udham Singh Nagar": { en: "Udham Singh Nagar", hi: "उधम सिंह नगर" },
  "Uttarkashi": { en: "Uttarkashi", hi: "उत्तरकाशी" },

  // ── GIGW Footer
  "footer_portal_credit": { en: "Authoritative Decision Support System • Ministry of Electronics & IT & NDMA", hi: "आधिकारिक निर्णय समर्थन प्रणाली • इलेक्ट्रॉनिकी एवं सूचना प्रौद्योगिकी मंत्रालय एवं NDMA" },
  "footer_compliance": { en: "Conforming to Guidelines for Indian Government Websites (GIGW 3.0) & NDMA Disaster SOP", hi: "भारतीय सरकारी वेबसाइट दिशानिर्देश (GIGW 3.0) एवं NDMA आपदा मानक संचालन प्रक्रिया के अनुरूप" },
  "footer_terms": { en: "Terms of Use", hi: "उपयोग की शर्तें" },
  "footer_privacy": { en: "Privacy Policy", hi: "गोपनीयता नीति" },
  "footer_hyperlink": { en: "Hyperlink Policy", hi: "हाइपरलिंक नीति" },
  "footer_copyright": { en: "Copyright Policy", hi: "कॉपीराइट नीति" },
  "footer_disclaimer": { en: "Disclaimer", hi: "अस्वीकरण" },
  "footer_accessibility": { en: "Accessibility Statement", hi: "पहुंच विवरण" },
  "footer_last_updated": { en: "Last Updated: 02 October 2026", hi: "अंतिम अद्यतन: 02 अक्टूबर 2026" },
  "footer_copyright_text": { en: "© 2026 Government of Uttarakhand & Disaster Management Authority. All Rights Reserved.", hi: "© 2026 उत्तराखंड सरकार एवं आपदा प्रबंधन प्राधिकरण। सर्वाधिकार सुरक्षित।" },
};

export function useTranslation() {
  const { lang } = useUIStore();

  const t = (key: string): string => {
    if (!key) return "";
    const cleanKey = key.trim();
    if (DICT[cleanKey]) {
      return DICT[cleanKey][lang] || DICT[cleanKey]["en"] || cleanKey;
    }
    // Case-insensitive lookup & value match
    const lower = cleanKey.toLowerCase();
    for (const [k, entry] of Object.entries(DICT)) {
      if (k.toLowerCase() === lower || entry.en.toLowerCase() === lower) {
        return entry[lang] || entry["en"] || cleanKey;
      }
    }
    return cleanKey;
  };

  return { t, lang };
}

