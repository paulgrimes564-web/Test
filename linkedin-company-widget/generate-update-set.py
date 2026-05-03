#!/usr/bin/env python3
"""
Generates a ServiceNow-importable Update Set XML from the widget source files.
Run: python3 generate-update-set.py
Output: linkedin-company-widget-update-set.xml
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

# XML-entity-encode for use as XML element text content
def enc(s):
    return sax.escape(s)

# Sys IDs (stable fake GUIDs for this widget)
SET_SYS_ID    = 'a9f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5'
XML_SYS_ID    = 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6'
WIDGET_SYS_ID = 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7'

# sys_property update XML entries
PROPERTIES = [
    ('linkedin.widget.title',          'Our LinkedIn',      'Widget header label'),
    ('linkedin.widget.company_name',   '',                  'Company display name'),
    ('linkedin.widget.tagline',        '',                  'Company tagline'),
    ('linkedin.widget.description',    '',                  'About tab description'),
    ('linkedin.widget.linkedin_url',   'https://www.linkedin.com/company/', 'Full LinkedIn page URL'),
    ('linkedin.widget.vanity_name',    '',                  'Slug after /company/ — enables badge'),
    ('linkedin.widget.company_id',     '',                  'Numeric company ID — enables Follow button'),
    ('linkedin.widget.logo_url',       '',                  'Square logo image URL'),
    ('linkedin.widget.banner_url',     '',                  'Banner/cover image URL'),
    ('linkedin.widget.website',        '',                  'Company website'),
    ('linkedin.widget.industry',       '',                  'Industry / sector'),
    ('linkedin.widget.company_size',   '',                  'Employee count range'),
    ('linkedin.widget.headquarters',   '',                  'HQ city/country'),
    ('linkedin.widget.location',       '',                  'Short location for card'),
    ('linkedin.widget.founded',        '',                  'Year founded'),
    ('linkedin.widget.followers',      '',                  'Follower count (numeric)'),
    ('linkedin.widget.theme',          'light',             'light or dark'),
    ('linkedin.widget.featured_posts', '[]',                'JSON array of featured posts'),
]

prop_xml_blocks = []
for i, (name, value, description) in enumerate(PROPERTIES):
    prop_sys_id = 'd{:02d}e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8'.format(i)
    prop_xml_sys_id = 'e{:02d}f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9'.format(i)
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
    <remote_update_set display_value="LinkedIn Company Widget v1.0">{SET_SYS_ID}</remote_update_set>
    <sys_class_name>sys_update_xml</sys_class_name>
    <sys_id>{prop_xml_sys_id}</sys_id>
    <type>sys_properties</type>
    <update_domain>global</update_domain>
  </sys_update_xml>''')

prop_xml = '\n'.join(prop_xml_blocks)

# Widget payload — code values are XML-entity-encoded within outer CDATA
widget_payload = (
    f'<?xml version="1.0" encoding="UTF-8"?>'
    f'<record_update table="sp_widget">'
    f'<sp_widget action="INSERT_OR_UPDATE">'
    f'<category>custom</category>'
    f'<description>LinkedIn Company Profile Widget — 3-tab portal card (Profile, Posts, About) using LinkedIn\'s official badge and follow-button SDKs.</description>'
    f'<name>LinkedIn Company Widget</name>'
    f'<id>linkedin-company-widget</id>'
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
<unload unload_date="2026-05-03 12:00:00">

  <!-- ═══════════════════════════════════════════════════════════
       Update Set: LinkedIn Company Widget v1.0
       Import via: System Update Sets > Retrieved Update Sets > Import
       ═══════════════════════════════════════════════════════════ -->

  <sys_remote_update_set action="INSERT_OR_UPDATE">
    <description>LinkedIn Company Profile Widget for ServiceNow Service Portal. Includes the sp_widget record and 18 sys_property configuration records.</description>
    <name>LinkedIn Company Widget v1.0</name>
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
    <name>sp_widget_linkedin-company-widget</name>
    <payload><![CDATA[{widget_payload}]]></payload>
    <remote_update_set display_value="LinkedIn Company Widget v1.0">{SET_SYS_ID}</remote_update_set>
    <sys_class_name>sys_update_xml</sys_class_name>
    <sys_id>{XML_SYS_ID}</sys_id>
    <type>sp_widget</type>
    <update_domain>global</update_domain>
  </sys_update_xml>

  <!-- ── sys_property configuration records ── -->
{prop_xml}

</unload>
'''

out_path = os.path.join(BASE, 'linkedin-company-widget-update-set.xml')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Generated: {out_path}')
print(f'  Widget sys_id : {WIDGET_SYS_ID}')
print(f'  Update set    : {SET_SYS_ID}')
print(f'  Properties    : {len(PROPERTIES)} sys_property records')
