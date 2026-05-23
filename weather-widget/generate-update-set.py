#!/usr/bin/env python3
"""
Generates a ServiceNow-importable Update Set XML from the widget source files.
Run: python3 generate-update-set.py
Output: weather-widget-update-set.xml
"""
import os, xml.sax.saxutils as sax

BASE = os.path.dirname(os.path.abspath(__file__))

def read(fname):
    with open(os.path.join(BASE, fname), encoding='utf-8') as f:
        return f.read()

# Load source files
html     = read('widget.html')
css      = read('widget.css')
client   = read('widget-client.js')
server   = read('widget-server.js')
schema   = read('widget-options.json')

def enc(s):
    return sax.escape(s)

# Stable fake GUIDs — different leading hex prefix from the LinkedIn widget
# so the two widgets' Update Sets never collide on the same instance.
SET_SYS_ID    = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'
XML_SYS_ID    = '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'
WIDGET_SYS_ID = '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'

PROPERTIES = [
    ('weather.widget.title',              'Weather',         'Widget header label'),
    ('weather.widget.city',               '',                'City to forecast (geocoded at runtime)'),
    ('weather.widget.country_code',       '',                'Optional ISO country code for disambiguation'),
    ('weather.widget.units',              'metric',          'metric or imperial'),
    ('weather.widget.theme',              'light',           'light or dark'),
    ('weather.widget.show_precipitation', 'true',            'Show precipitation bars on Hourly tab'),
    ('weather.widget.refresh_minutes',    '30',              'Auto-refresh interval in minutes (0 to disable)'),
]

prop_xml_blocks = []
for i, (name, value, description) in enumerate(PROPERTIES):
    prop_sys_id     = 'a{:02d}b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'.format(i)
    prop_xml_sys_id = 'b{:02d}c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'.format(i)
    prop_payload = (
        f'<?xml version="1.0" encoding="UTF-8"?>'
        f'<record_update table="sys_properties">'
        f'<sys_properties action="INSERT_OR_UPDATE">'
        f'<description>{enc(description)}</description>'
        f'<name>{enc(name)}</name>'
        f'<type>string</type>'
        f'<value>{enc(value)}</value>'
        f'<sys_id>{prop_sys_id}</sys_id>'
        f'<sys_scope display_value="Global">global</sys_scope>'
        f'</sys_properties>'
        f'</record_update>'
    )
    prop_xml_blocks.append(f'''  <sys_update_xml action="INSERT_OR_UPDATE">
    <action>INSERT_OR_UPDATE</action>
    <name>sys_properties_{prop_sys_id}</name>
    <payload><![CDATA[{prop_payload}]]></payload>
    <remote_update_set display_value="Weather Widget v1.0">{SET_SYS_ID}</remote_update_set>
    <sys_class_name>sys_update_xml</sys_class_name>
    <sys_id>{prop_xml_sys_id}</sys_id>
    <type>sys_properties</type>
    <update_domain>global</update_domain>
  </sys_update_xml>''')

prop_xml = '\n'.join(prop_xml_blocks)

widget_payload = (
    f'<?xml version="1.0" encoding="UTF-8"?>'
    f'<record_update table="sp_widget">'
    f'<sp_widget action="INSERT_OR_UPDATE">'
    f'<category>custom</category>'
    f'<description>Weather Widget — 3-tab portal card (Current, Hourly, Daily) powered by the Open-Meteo public API.</description>'
    f'<name>Weather Widget</name>'
    f'<id>weather-widget</id>'
    f'<template>{enc(html)}</template>'
    f'<css>{enc(css)}</css>'
    f'<client_script>{enc(client)}</client_script>'
    f'<script>{enc(server)}</script>'
    f'<option_schema>{enc(schema)}</option_schema>'
    f'<sys_id>{WIDGET_SYS_ID}</sys_id>'
    f'<sys_scope display_value="Global">global</sys_scope>'
    f'<sys_domain>global</sys_domain>'
    f'</sp_widget>'
    f'</record_update>'
)

output = f'''<?xml version="1.0" encoding="UTF-8"?>
<unload unload_date="2026-05-23 12:00:00">

  <!-- ═══════════════════════════════════════════════════════════
       Update Set: Weather Widget v1.0
       Import via: System Update Sets > Retrieved Update Sets > Import
       ═══════════════════════════════════════════════════════════ -->

  <sys_remote_update_set action="INSERT_OR_UPDATE">
    <description>Weather Widget for ServiceNow Service Portal. Includes the sp_widget record and 7 sys_property configuration records. Data source: Open-Meteo (no API key required).</description>
    <name>Weather Widget v1.0</name>
    <origin_sys_id/>
    <parent/>
    <remote_sys_id>{SET_SYS_ID}</remote_sys_id>
    <state>loaded</state>
    <sys_class_name>sys_remote_update_set</sys_class_name>
    <sys_id>{SET_SYS_ID}</sys_id>
    <type>Other</type>
    <update_set_link/>
  </sys_remote_update_set>

  <!-- ── sp_widget record ── -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <action>INSERT_OR_UPDATE</action>
    <name>sp_widget_weather-widget</name>
    <payload><![CDATA[{widget_payload}]]></payload>
    <remote_update_set display_value="Weather Widget v1.0">{SET_SYS_ID}</remote_update_set>
    <sys_class_name>sys_update_xml</sys_class_name>
    <sys_id>{XML_SYS_ID}</sys_id>
    <type>sp_widget</type>
    <update_domain>global</update_domain>
  </sys_update_xml>

  <!-- ── sys_property configuration records ── -->
{prop_xml}

</unload>
'''

out_path = os.path.join(BASE, 'weather-widget-update-set.xml')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Generated: {out_path}')
print(f'  Widget sys_id : {WIDGET_SYS_ID}')
print(f'  Update set    : {SET_SYS_ID}')
print(f'  Properties    : {len(PROPERTIES)} sys_property records')
