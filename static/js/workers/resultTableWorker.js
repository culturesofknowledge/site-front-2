// // tableWorker.js

// function escapeHtml(str) {
//   if (str === null || str === undefined) return "";
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }

// function formatDate(val) {
//   if (!val) return "";
//   try {
//     const d = new Date(val);
//     if (isNaN(d)) return val;
//     return new Intl.DateTimeFormat("en-GB", {
//       year: "numeric",
//       month: "short",
//       day: "2-digit",
//     }).format(d);
//   } catch (e) {
//     return val;
//   }
// }

// onmessage = function (ev) {
//   console.log("Worker working");
//   const {
//     results = [],
//     tableDisplay = [],
//     pageSize = 50,
//     pageNumber = 1,
//     showIndex = false,
//     showCheckbox = false,
//     serialHeader = "#",
//     omitFieldIfEmpty = false,
//     displayField,
//     selectField,
//     defaultSelected = [],
//   } = ev.data;

//   const headers = tableDisplay
//     .map((field) => `<th>${escapeHtml(field.header || "")}</th>`)
//     .join("");

//   const headerRow = showIndex
//     ? `<tr>${showCheckbox ? "<th></th>" : ""}<th>${escapeHtml(
//         serialHeader
//       )}</th>${headers}</tr>`
//     : `<tr>${showCheckbox ? "<th></th>" : ""}${headers}</tr>`;

//   const rows = results
//     .map((res, rowIdx) => {
//       const continuousIndex = (pageNumber - 1) * pageSize + rowIdx + 1;

//       const cells = tableDisplay
//         .map((field, fIdx) => {
//           if (field.__hasValueFunction) {
//             const token = `__WF_${rowIdx}_${fIdx}__`;
//             return `<td>${token}</td>`;
//           }

//           let val = "";
//           if (field.field && res.hasOwnProperty(field.field)) {
//             val = res[field.field];
//           }
//           if (val || val === 0) val = escapeHtml(val);

//           if (field.type === "date") {
//             return `<td>${escapeHtml(formatDate(val))}</td>`;
//           }
//           if (field.type === "pre") {
//             return `<td><pre>${val}</pre></td>`;
//           }
//           if (field.type === "link") {
//             let href = field.linkHref ? res[field.linkHref] || val : val;
//             let linkText = field.linkText || val;
//             let prefix = field.linkHrefPrefix || "";
//             if (prefix) {
//               const subPagen = res.object_type || "";
//               if (subPagen === "institution") {
//                 return `<td><a href="${prefix}/repository/${href}">${linkText}</a></td>`;
//               } else if (subPagen) {
//                 return `<td><a href="${prefix}/${subPagen}/${href}">${linkText}</a></td>`;
//               }
//               return `<td><a href="${prefix}/${href}">${linkText}</a></td>`;
//             }
//             return `<td><a href="${href}">${linkText}</a></td>`;
//           }

//           return `<td>${val}</td>`;
//         })
//         .join("");

//       const data = res[selectField];
//       const isChecked = defaultSelected.includes(data) ? "checked" : "";
//       const checkboxCell = showCheckbox
//         ? `<td><input type="checkbox" class="select-row" data-uuid="${escapeHtml(
//             String(data)
//           )}" data-display="${escapeHtml(
//             String(res[displayField] || "")
//           )}" ${isChecked}></td>`
//         : "";

//       return showIndex
//         ? `<tr>${checkboxCell}<td>${continuousIndex}</td>${cells}</tr>`
//         : `<tr>${checkboxCell}${cells}</tr>`;
//     })
//     .join("");

//   postMessage({
//     tableHtml: `
//       <table class="table table-bordered">
//         <thead>${headerRow}</thead>
//         <tbody>${rows}</tbody>
//       </table>`,
//     hasPlaceholders: tableDisplay.some((f) => f.__hasValueFunction),
//   });
// };

// resultTableWorker.js
self.onmessage = function (e) {
  const { results, tableDisplay, selectField, displayField, defaultSelected } =
    e.data;

  // prepare simplified row data
  const rowData = results.map((res, index) => {
    const rowObj = {};

    tableDisplay.forEach((field) => {
      let val = "";
      if (field.field) {
        val = res[field.field] || "";
      }
      rowObj[field.header] = val;
    });

    // ID + selection info
    const data = res[selectField];
    return {
      uuid: data,
      display: res[displayField],
      fields: rowObj,
      isSelected: defaultSelected.includes(data),
    };
  });

  self.postMessage({ rows: rowData });
};
