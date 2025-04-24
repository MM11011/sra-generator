// script.js

const frameworkSelect = document.getElementById('frameworkSelect');
const auditContainer = document.getElementById('auditContainer');
const fileUpload = document.getElementById('fileUpload');
const saveButton = document.getElementById('saveButton');
const submitButton = document.getElementById('submitButton');

let auditData = [];

const allAuditRows = [
  {
    domain: 'Access Control',
    sfdc: ['Profiles', 'Permission Sets', 'Sharing Rules'],
    frameworks: {
      'NIST 800-53': 'AC-2, AC-6',
      'ISO 27001': 'A.9.2',
      'COBIT': 'DSS05.04'
    },
    findings: ['', '', '']
  },
  {
    domain: 'Audit Logging & Monitoring',
    sfdc: ['Event Monitoring', 'Login History'],
    frameworks: {
      'NIST 800-53': 'AU-6, AU-12',
      'ISO 27001': 'A.12.4',
      'COBIT': 'DSS01.05'
    },
    findings: ['', '']
  },
  {
    domain: 'Encryption',
    sfdc: ['Shield Platform Encryption', 'Field-Level Encryption'],
    frameworks: {
      'NIST 800-53': 'SC-12, SC-28',
      'ISO 27001': 'A.10.1',
      'COBIT': 'DSS05.10'
    },
    findings: ['', '']
  },
  {
    domain: 'Incident Response',
    sfdc: ['Event Monitoring Policies', 'Email Alerts'],
    frameworks: {
      'NIST 800-53': 'IR-4',
      'ISO 27001': 'A.16.1',
      'COBIT': 'DSS02'
    },
    findings: ['', '']
  },
  {
    domain: 'Backup & Recovery',
    sfdc: ['Data Export', '3rd-Party Backup Tools'],
    frameworks: {
      'NIST 800-53': 'CP-9',
      'ISO 27001': 'A.12.3',
      'COBIT': 'DSS04.01'
    },
    findings: ['', '']
  },
  {
    domain: 'Configuration Management',
    sfdc: ['Security Health Check', 'Setup Audit Trail'],
    frameworks: {
      'NIST 800-53': 'CM-6'
    },
    findings: ['', '']
  },
  {
    domain: 'User Authentication',
    sfdc: ['MFA', 'SSO'],
    frameworks: {
      'NIST 800-53': 'IA-2'
    },
    findings: ['', '']
  },
  {
    domain: 'System Monitoring',
    sfdc: ['Event Monitoring Analytics'],
    frameworks: {
      'NIST 800-53': 'SI-4'
    },
    findings: ['']
  },
  {
    domain: 'Security Policies',
    sfdc: ['Shield Policies'],
    frameworks: {
      'NIST 800-53': 'PL-2'
    },
    findings: ['']
  },
  {
    domain: 'System and Communications Protection',
    sfdc: ['TLS Configuration', 'IP Whitelisting'],
    frameworks: {
      'NIST 800-53': 'SC-7'
    },
    findings: ['', '']
  }
];

function renderAuditTemplate(selectedFrameworks) {
  auditContainer.innerHTML = '';
  auditData = [];
  allAuditRows.forEach((row, index) => {
    const hasMatch = selectedFrameworks.some(f => row.frameworks[f]);
    if (!hasMatch) return;

    const entry = document.createElement('div');
    entry.className = 'audit-entry';
    const frameworkLines = selectedFrameworks.map(f => {
      return row.frameworks[f] ? `<div><strong>${f}:</strong> ${row.frameworks[f]}</div>` : '';
    }).join('');

    const controlInputs = row.sfdc.map((control, ctrlIndex) => `
      <div class="sfdc-control">
        <label for="finding-${index}-${ctrlIndex}"><strong>${control}</strong> - Findings:</label>
        <textarea id="finding-${index}-${ctrlIndex}" data-row="${index}" data-ctrl="${ctrlIndex}">${row.findings[ctrlIndex] || ''}</textarea>
      </div>
    `).join('');

    entry.innerHTML = `
      <h3>${row.domain}</h3>
      <div><strong>Framework Mapping:</strong><br>${frameworkLines || '<em>No mapping for selected frameworks.</em>'}</div>
      ${controlInputs}
    `;
    auditContainer.appendChild(entry);
    auditData.push({
      ...row,
      frameworks: Object.fromEntries(selectedFrameworks.map(f => [f, row.frameworks[f]]))
    });
  });
}

frameworkSelect.addEventListener('change', () => {
  const selected = Array.from(frameworkSelect.selectedOptions).map(o => o.value);
  renderAuditTemplate(selected);
});

saveButton.addEventListener('click', () => {
  document.querySelectorAll('textarea').forEach(textarea => {
    const rowIdx = textarea.dataset.row;
    const ctrlIdx = textarea.dataset.ctrl;
    if (!auditData[rowIdx].findings) auditData[rowIdx].findings = [];
    auditData[rowIdx].findings[ctrlIdx] = textarea.value;
  });
  const blob = new Blob([JSON.stringify(auditData)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'audit_template.json';
  link.click();
});

submitButton.addEventListener('click', async () => {
  document.querySelectorAll('textarea').forEach(textarea => {
    const rowIdx = textarea.dataset.row;
    const ctrlIdx = textarea.dataset.ctrl;
    if (!auditData[rowIdx].findings) auditData[rowIdx].findings = [];
    auditData[rowIdx].findings[ctrlIdx] = textarea.value;
  });

  const { utils, writeFile } = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');

  const exportData = auditData.flatMap(row =>
    row.sfdc.map((control, i) => ({
      'Control Domain': row.domain,
      'SFDC Mapping': control,
      'Framework Mapping': Object.entries(row.frameworks || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
      'Findings': row.findings[i] || ''
    }))
  );

  const ws = utils.json_to_sheet(exportData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Audit Results');
  writeFile(wb, 'Audit_Report_With_Findings.xlsx');
});

fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const loaded = JSON.parse(evt.target.result);
    auditData = loaded;
    const selectedFrameworks = Array.from(frameworkSelect.selectedOptions).map(o => o.value);
    renderAuditTemplate(selectedFrameworks);
    document.querySelectorAll('textarea').forEach(textarea => {
      const rowIdx = textarea.dataset.row;
      const ctrlIdx = textarea.dataset.ctrl;
      textarea.value = auditData[rowIdx].findings?.[ctrlIdx] || '';
    });
  };
  reader.readAsText(file);
});