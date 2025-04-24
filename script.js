// script.js

const frameworkSelect = document.getElementById('frameworkSelect');
const auditContainer = document.getElementById('auditContainer');
const fileUpload = document.getElementById('fileUpload');
const saveButton = document.getElementById('saveButton');
const submitButton = document.getElementById('submitButton');

let auditData = [];

const allAuditRows = [
  // GDPR and PCI-DSS mappings added to each applicable domain below
  {
    domain: 'Access Control',
    sfdc: ['Profiles', 'Permission Sets', 'Sharing Rules'],
    frameworks: {
      'NIST 800-53': 'AC-2, AC-6',
      'ISO 27001': 'A.9.2',
      'COBIT': 'DSS05.04',
      'HIPAA': '§164.308(a)(4)',
      'SOC 2': 'CC6.1',
      'GDPR': 'Art. 32(1)(b)',
      'PCI-DSS': '7.1'
    }
  },
  {
    domain: 'Audit Logging & Monitoring',
    sfdc: ['Event Monitoring', 'Login History'],
    frameworks: {
      'NIST 800-53': 'AU-6, AU-12',
      'ISO 27001': 'A.12.4',
      'COBIT': 'DSS01.05',
      'HIPAA': '§164.312(b)',
      'SOC 2': 'CC7.2',
      'GDPR': 'Art. 30',
      'PCI-DSS': '10.2'
    }
  },
  {
    domain: 'Encryption',
    sfdc: ['Shield Platform Encryption', 'Field-Level Encryption'],
    frameworks: {
      'NIST 800-53': 'SC-12, SC-28',
      'ISO 27001': 'A.10.1',
      'COBIT': 'DSS05.10',
      'HIPAA': '§164.312(a)(2)(iv)',
      'SOC 2': 'CC6.6',
      'GDPR': 'Art. 32(1)(a)',
      'PCI-DSS': '3.4, 4.1'
    }
  },
  {
    domain: 'Incident Response',
    sfdc: ['Event Monitoring Policies', 'Email Alerts'],
    frameworks: {
      'NIST 800-53': 'IR-4',
      'ISO 27001': 'A.16.1',
      'COBIT': 'DSS02',
      'HIPAA': '§164.308(a)(6)',
      'SOC 2': 'CC7.5',
      'GDPR': 'Art. 33',
      'PCI-DSS': '12.10'
    }
  },
  {
    domain: 'Backup & Recovery',
    sfdc: ['Data Export', '3rd-Party Backup Tools'],
    frameworks: {
      'NIST 800-53': 'CP-9',
      'ISO 27001': 'A.12.3',
      'COBIT': 'DSS04.01',
      'HIPAA': '§164.308(a)(7)',
      'SOC 2': 'CC7.4',
      'GDPR': 'Art. 32(1)(c)',
      'PCI-DSS': '12.1'
    }
  },
  {
    domain: 'Configuration Management',
    sfdc: ['Security Health Check', 'Setup Audit Trail'],
    frameworks: {
      'NIST 800-53': 'CM-6',
      'ISO 27001': 'A.12.1.2',
      'COBIT': 'BAI09.01',
      'GDPR': 'Art. 25',
      'PCI-DSS': '2.2'
    }
  },
  {
    domain: 'User Authentication',
    sfdc: ['MFA', 'SSO'],
    frameworks: {
      'NIST 800-53': 'IA-2',
      'ISO 27001': 'A.9.4',
      'COBIT': 'DSS05.03',
      'GDPR': 'Art. 32(1)(d)',
      'PCI-DSS': '8.1'
    }
  },
  {
    domain: 'System Monitoring',
    sfdc: ['Event Monitoring Analytics'],
    frameworks: {
      'NIST 800-53': 'SI-4',
      'ISO 27001': 'A.12.4.1',
      'GDPR': 'Art. 32(1)(c)',
      'PCI-DSS': '10.6'
    }
  },
  {
    domain: 'Security Policies',
    sfdc: ['Shield Policies'],
    frameworks: {
      'NIST 800-53': 'PL-2',
      'ISO 27001': 'A.5.1.1',
      'GDPR': 'Art. 24',
      'PCI-DSS': '12.2'
    }
  },
  {
    domain: 'System and Communications Protection',
    sfdc: ['TLS Configuration', 'IP Whitelisting'],
    frameworks: {
      'NIST 800-53': 'SC-7',
      'ISO 27001': 'A.13.1.1',
      'GDPR': 'Art. 5(1)(f)',
      'PCI-DSS': '1.2'
    }
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
    entry.innerHTML = `<h3>${row.domain}</h3>`;

    selectedFrameworks.slice(0, 3).forEach((framework, fIndex) => {
      const controlSet = row.frameworks[framework];
      if (!controlSet) return;

      const frameworkBox = document.createElement('div');
      frameworkBox.className = 'framework-box';
      frameworkBox.innerHTML = `<div class="framework-label"><strong>${framework}:</strong> ${controlSet}</div>`;

      row.sfdc.forEach((control, ctrlIndex) => {
        const controlId = `finding-${index}-${ctrlIndex}-${fIndex}`;
        const findingValue = row[`findings_${framework}`]?.[ctrlIndex] || '';

        const controlBlock = document.createElement('div');
        controlBlock.className = 'sfdc-control';
        controlBlock.innerHTML = `
          <label for="${controlId}"><strong>${control}</strong> - Findings (${framework}):</label>
          <textarea id="${controlId}" data-row="${index}" data-ctrl="${ctrlIndex}" data-fw="${framework}">${findingValue}</textarea>
        `;
        frameworkBox.appendChild(controlBlock);
      });

      entry.appendChild(frameworkBox);
    });

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
    const framework = textarea.dataset.fw;
    if (!auditData[rowIdx][`findings_${framework}`]) auditData[rowIdx][`findings_${framework}`] = [];
    auditData[rowIdx][`findings_${framework}`][ctrlIdx] = textarea.value;
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
    const framework = textarea.dataset.fw;
    if (!auditData[rowIdx][`findings_${framework}`]) auditData[rowIdx][`findings_${framework}`] = [];
    auditData[rowIdx][`findings_${framework}`][ctrlIdx] = textarea.value;
  });

  const { utils, writeFile } = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');

  const exportData = auditData.flatMap(row =>
    row.sfdc.flatMap((control, i) =>
      Object.keys(row.frameworks || {}).map(framework => ({
        'Control Domain': row.domain,
        'SFDC Mapping': control,
        'Framework': framework,
        'Framework Mapping': row.frameworks[framework],
        'Findings': row[`findings_${framework}`]?.[i] || ''
      }))
    )
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
      const framework = textarea.dataset.fw;
      textarea.value = auditData[rowIdx][`findings_${framework}`]?.[ctrlIdx] || '';
    });
  };
  reader.readAsText(file);
});
