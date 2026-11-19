const CLAVE_STORAGE = "portlogistics-planificador-v2";

const EQUIPO = [
    { id: "nicolas", nombre: "Nicolás López Barrera", corto: "Nicolás", sigla: "NL", rol: "SQA / Calidad" },
    { id: "oscar", nombre: "Oscar Javier Preciado Tafur", corto: "Oscar", sigla: "OP", rol: "PM / Arquitecto" },
    { id: "juan", nombre: "Juan David Torres Uyazan", corto: "Juan David", sigla: "JT", rol: "Product Owner" }
];

const ESTADOS = [
    { id: "todo", nombre: "Por hacer" },
    { id: "doing", nombre: "En curso" },
    { id: "review", nombre: "En revisión" },
    { id: "done", nombre: "Hecho" }
];

const PRIORIDADES = [
    { id: "alta", nombre: "Alta" },
    { id: "media", nombre: "Media" },
    { id: "baja", nombre: "Baja" }
];

const SPRINTS_INICIALES = [
    { id: "s1", nombre: "Sprint 1", meta: "Elicitación y especificación inicial del caso.", estado: "cerrado", inicio: "2026-11-02", fin: "2026-11-06" },
    { id: "s2", nombre: "Sprint 2", meta: "Historias, requisitos y diagramas UML.", estado: "cerrado", inicio: "2026-11-09", fin: "2026-11-11" },
    { id: "s3", nombre: "Sprint 3", meta: "Verificación y validación de requisitos y casos de uso.", estado: "cerrado", inicio: "2026-11-11", fin: "2026-11-12" },
    { id: "s4", nombre: "Sprint 4 · Validación", meta: "Control de cambios (CCB) y validación: RFC-01 aprobada, RFC-02 aplazada, pruebas de aceptación y congelación de LB-1.1.", estado: "activo", inicio: "2026-11-13", fin: "2026-11-20" }
];

const SEMANA_A_SPRINT = { "Semana 1": "s1", "Semana 2": "s2", "Semana 3": "s3", "Semana 4": "s4" };
const ESTADO_POR_SEMANA = { "Semana 1": "done", "Semana 2": "done", "Semana 3": "done", "Semana 4": "review" };

/* Encargado y fecha real de cada entregable (la fecha sale del encabezado del propio documento;
   si el documento no trae fecha, el entregable termina al cierre de su sprint). */
const DATOS_ENTREGABLE = {
    "documentos/S1_Texto_Inicial.pdf": { responsable: "juan" },
    "documentos/S1_Entrevista_Elicitacion.pdf": { responsable: "juan" },
    "documentos/S1_SRS.pdf": { responsable: "nicolas", fecha: "2026-11-03" },
    "documentos/S2_HU.pdf": { responsable: "nicolas", fecha: "2026-11-11" },
    "documentos/S2_CU.pdf": { responsable: "nicolas" },
    "documentos/S2_RF_RNF.pdf": { responsable: "oscar", fecha: "2026-11-11" },
    "documentos/S2_TR_CR.pdf": { responsable: "oscar", fecha: "2026-11-11" },
    "documentos/S3_VE_VA_WT.pdf": { responsable: "nicolas", fecha: "2026-11-11" },
    "documentos/S3_VA_CU.pdf": { responsable: "nicolas", fecha: "2026-11-11" },
    "documentos/S4_CCB_V2.pdf": { responsable: "oscar", fecha: "2026-11-17" },
    "documentos/Contexto.zip": { responsable: "juan" }
};

/* Compromisos del apartado 5 del acta CCB (S4_CCB_V2). Las fechas son plan dentro del Sprint 4. */
const TAREAS_S4 = [
    { titulo: "Implementar RFC-01 y actualizar diagramas UML", descripcion: "Implementar y revisar el Change Set de RFC-01 (regla de inspección prioritaria, nodo N88301) y actualizar DE-ADU-01, DS-GRU-01/02/03 y DA-NOT-01.", responsable: "oscar", estado: "doing", prioridad: "alta", puntos: 8, inicio: "2026-11-16", fin: "2026-11-19" },
    { titulo: "Actualizar RF-14 e historias HU-015, 005, 006 y 017", descripcion: "Acordar la nueva regla con aduana y con grúas y patio, y actualizar requisito e historias afectadas.", responsable: "juan", estado: "doing", prioridad: "alta", puntos: 5, inicio: "2026-11-16", fin: "2026-11-18" },
    { titulo: "Comunicar aplazamiento de RFC-02 a la Autoridad Portuaria", descripcion: "Informar el aplazamiento y las condiciones para reconsiderarla en una fase posterior.", responsable: "juan", estado: "todo", prioridad: "media", puntos: 2, inicio: "2026-11-18", fin: "2026-11-19" },
    { titulo: "Ejecutar 7 pruebas de aceptación y actualizar RTM", descripcion: "PA-RF-05, 06, 07, 14, 15, 16 y PA-RNF-04. Documentar evidencias, cerrar el hallazgo H-09 y validar antes de congelar LB-1.1.", responsable: "nicolas", estado: "todo", prioridad: "alta", puntos: 8, inicio: "2026-11-18", fin: "2026-11-20" },
    { titulo: "Congelar línea base LB-1.1", descripcion: "El CCB congela LB-1.1 cuando se verifique RFC-01 y se superen las pruebas.", responsable: "oscar", estado: "todo", prioridad: "alta", puntos: 1, inicio: "2026-11-20", fin: "2026-11-20" }
];

function tipoDeArchivo(archivo) {
    if (/\.(png|jpe?g|webp|svg)$/i.test(archivo)) return "Diagrama";
    if (/\.pdf$/i.test(archivo)) return "Documento";
    if (/\.docx?$/i.test(archivo)) return "Acta";
    if (/\.zip$/i.test(archivo)) return "Paquete";
    return "Tarea";
}

function puntosDe(tipo) {
    if (tipo === "Diagrama") return 2;
    if (tipo === "Documento" || tipo === "Acta") return 5;
    if (tipo === "Paquete") return 1;
    return 3;
}

function semilla() {
    const sprints = SPRINTS_INICIALES.map(x => ({ ...x }));
    const incidencias = window.CATALOGO.map((item, indice) => {
        const tipo = tipoDeArchivo(item.archivo);
        const sprint = SEMANA_A_SPRINT[item.semana] || null;
        const ref = sprints.find(x => x.id === sprint);
        const datos = DATOS_ENTREGABLE[item.archivo] || {};
        return {
            id: "PL-" + (indice + 1),
            titulo: item.nombre,
            descripcion: "Entregable del repositorio. Se puede mover entre el backlog y los sprints.",
            tipo,
            archivo: item.archivo,
            sprint,
            estado: ESTADO_POR_SEMANA[item.semana] || "todo",
            prioridad: tipo === "Documento" || tipo === "Acta" ? "alta" : "media",
            puntos: puntosDe(tipo),
            responsable: datos.responsable || "oscar",
            inicio: ref ? ref.inicio : null,
            fin: ref ? (datos.fecha || ref.fin) : null
        };
    });
    let n = incidencias.length;
    TAREAS_S4.forEach(t => {
        n += 1;
        incidencias.push({ id: "PL-" + n, tipo: "Tarea", archivo: null, sprint: "s4", ...t });
    });
    return { sprints, incidencias, siguiente: n + 1 };
}

function cargar() {
    try {
        const guardado = localStorage.getItem(CLAVE_STORAGE);
        if (!guardado) return semilla();
        const datos = JSON.parse(guardado);
        if (!datos.incidencias || !datos.sprints) return semilla();
        return datos;
    } catch (error) {
        return semilla();
    }
}

function guardar() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
}

const estado = cargar();
let vista = "tablero";
let filtroTexto = "";
let incidenciaAbierta = null;

const $ = (sel) => document.querySelector(sel);

function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function nombreSprint(id) {
    if (!id) return "Backlog";
    const sprint = estado.sprints.find(s => s.id === id);
    return sprint ? sprint.nombre : "Backlog";
}

const DIA = 86400000;
const aMs = (iso) => (iso ? Date.parse(iso + "T00:00:00Z") : null);
const aISO = (ms) => new Date(ms).toISOString().slice(0, 10);
function fmtFecha(iso) {
    if (!iso) return "—";
    return new Date(aMs(iso)).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "UTC" }).replace(/\./g, "");
}
function rangoFechas(obj) {
    return obj.inicio && obj.fin ? fmtFecha(obj.inicio) + " – " + fmtFecha(obj.fin) : "Sin fechas";
}
function persona(id) { return EQUIPO.find(p => p.id === id) || null; }
function nombreResponsable(id) { const p = persona(id); return p ? p.nombre : "Sin asignar"; }
function cortoResponsable(id) { const p = persona(id); return p ? p.corto : "Sin asignar"; }
function avatar(id) {
    const p = persona(id);
    return `<span class="avatar ${p ? p.id : "nadie"}" title="${escapar(nombreResponsable(id))}">${p ? p.sigla : "?"}</span>`;
}
function opcionesResponsable(seleccionado, conTodos) {
    const base = conTodos
        ? `<option value="" ${!seleccionado ? "selected" : ""}>Todo el equipo</option>`
        : `<option value="" ${!seleccionado ? "selected" : ""}>Sin asignar</option>`;
    return base + EQUIPO.map(p => `<option value="${p.id}" ${p.id === seleccionado ? "selected" : ""}>${escapar(p.nombre)} · ${escapar(p.rol)}</option>`).join("");
}
function nombreEstado(id) {
    return (ESTADOS.find(e => e.id === id) || ESTADOS[0]).nombre;
}

function coincideBusqueda(incidencia) {
    if (!filtroTexto) return true;
    const blob = normalizar([incidencia.id, incidencia.titulo, incidencia.tipo, nombreSprint(incidencia.sprint), nombreResponsable(incidencia.responsable)].join(" "));
    return blob.includes(filtroTexto);
}

function incidenciasVisibles() {
    return estado.incidencias.filter(coincideBusqueda);
}

function sprintActivo() {
    return estado.sprints.find(s => s.estado === "activo") || estado.sprints[0];
}

function opcionesSprint(seleccionado, incluirBacklog) {
    const opciones = [];
    if (incluirBacklog) {
        opciones.push(`<option value="" ${!seleccionado ? "selected" : ""}>Backlog</option>`);
    }
    estado.sprints.forEach(sprint => {
        opciones.push(`<option value="${sprint.id}" ${sprint.id === seleccionado ? "selected" : ""}>${escapar(sprint.nombre)}</option>`);
    });
    return opciones.join("");
}

function opcionesEstado(seleccionado) {
    return ESTADOS.map(item => `<option value="${item.id}" ${item.id === seleccionado ? "selected" : ""}>${item.nombre}</option>`).join("");
}

function opcionesPrioridad(seleccionado) {
    return PRIORIDADES.map(item => `<option value="${item.id}" ${item.id === seleccionado ? "selected" : ""}>${item.nombre}</option>`).join("");
}

function chipPrioridad(prioridad) {
    return `<span class="chip ${prioridad}">${escapar(prioridad)}</span>`;
}

function renderNav() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("activo", btn.dataset.vista === vista);
    });
    const backlog = estado.incidencias.filter(i => !i.sprint).length;
    const badge = $("#badge-backlog");
    if (badge) badge.textContent = backlog;
}

function resumenHtml(lista) {
    const hechos = lista.filter(i => i.estado === "done").length;
    const puntos = lista.reduce((suma, i) => suma + Number(i.puntos || 0), 0);
    const puntosHechos = lista.filter(i => i.estado === "done").reduce((suma, i) => suma + Number(i.puntos || 0), 0);
    return `
        <div class="resumen">
            <article><b>${lista.length}</b><span>Incidencias</span></article>
            <article><b>${hechos}</b><span>Hechas</span></article>
            <article><b>${puntos}</b><span>Puntos</span></article>
            <article><b>${puntosHechos}</b><span>Puntos cerrados</span></article>
        </div>`;
}

function renderTablero() {
    const seleccionado = $("#sprint-tablero") ? $("#sprint-tablero").value : (sprintActivo() ? sprintActivo().id : "");
    const delSprint = incidenciasVisibles().filter(i => i.sprint === seleccionado);

    const columnas = ESTADOS.map(col => {
        const items = delSprint.filter(i => i.estado === col.id);
        const tarjetas = items.map(incidencia => `
            <article class="tarjeta-issue" draggable="true" data-id="${incidencia.id}">
                <span class="clave">${escapar(incidencia.id)}</span>
                <h3>${escapar(incidencia.titulo)}</h3>
                <div class="meta-issue">
                    <span class="chip">${escapar(incidencia.tipo)}</span>
                    ${chipPrioridad(incidencia.prioridad)}
                    <span class="chip puntos">${incidencia.puntos} pts</span>
                </div>
                <div class="pie-issue">${avatar(incidencia.responsable)}<span>${escapar(cortoResponsable(incidencia.responsable))}</span><span class="fecha-issue">${escapar(rangoFechas(incidencia))}</span></div>
            </article>`).join("");

        return `
            <section class="columna" data-estado="${col.id}">
                <div class="columna-cabeza">
                    <span class="punto"></span>
                    ${col.nombre}
                    <span class="cuenta">${items.length}</span>
                </div>
                ${tarjetas || '<div class="vacio">Suelta una incidencia aquí</div>'}
            </section>`;
    }).join("");

    $("#vista").innerHTML = `
        <div class="encabezado-vista">
            <div>
                <h1>Tablero</h1>
                <p>Arrastra cada entregable entre columnas. El trabajo pertenece al sprint que elijas.</p>
            </div>
            <div class="fila-controles">
                <select class="filtro" id="sprint-tablero" aria-label="Sprint del tablero">${opcionesSprint(seleccionado, false)}</select>
                <button class="btn btn-primario" id="btn-nueva" type="button">Nueva incidencia</button>
            </div>
        </div>
        ${resumenHtml(delSprint)}
        <div class="tablero">${columnas}</div>`;

    $("#sprint-tablero").addEventListener("change", render);
    $("#btn-nueva").addEventListener("click", abrirModalNueva);
    activarArrastre();
}

function activarArrastre() {
    let origen = null;
    document.querySelectorAll(".tarjeta-issue").forEach(tarjeta => {
        tarjeta.addEventListener("dragstart", (evento) => {
            origen = tarjeta.dataset.id;
            tarjeta.classList.add("arrastrando");
            evento.dataTransfer.setData("text/plain", origen);
            evento.dataTransfer.effectAllowed = "move";
        });
        tarjeta.addEventListener("dragend", () => tarjeta.classList.remove("arrastrando"));
        tarjeta.addEventListener("click", () => abrirIncidencia(tarjeta.dataset.id));
    });

    document.querySelectorAll(".columna").forEach(columna => {
        columna.addEventListener("dragover", (evento) => {
            evento.preventDefault();
            columna.classList.add("sobre");
        });
        columna.addEventListener("dragleave", () => columna.classList.remove("sobre"));
        columna.addEventListener("drop", (evento) => {
            evento.preventDefault();
            columna.classList.remove("sobre");
            const id = evento.dataTransfer.getData("text/plain") || origen;
            const incidencia = estado.incidencias.find(i => i.id === id);
            if (!incidencia) return;
            incidencia.estado = columna.dataset.estado;
            guardar();
            render();
        });
    });
}

function renderBacklog() {
    const filas = incidenciasVisibles().map(incidencia => `
        <tr>
            <td><span class="clave">${escapar(incidencia.id)}</span></td>
            <td><button class="enlace-issue" data-id="${incidencia.id}" type="button">${escapar(incidencia.titulo)}</button></td>
            <td><span class="persona">${avatar(incidencia.responsable)}${escapar(cortoResponsable(incidencia.responsable))}</span></td>
            <td class="nowrap">${escapar(rangoFechas(incidencia))}</td>
            <td>${escapar(incidencia.tipo)}</td>
            <td>${chipPrioridad(incidencia.prioridad)}</td>
            <td>${incidencia.puntos}</td>
            <td>${escapar(nombreEstado(incidencia.estado))}</td>
            <td>
                <select class="filtro mover-sprint" data-id="${incidencia.id}" aria-label="Asignar sprint de ${escapar(incidencia.id)}">
                    ${opcionesSprint(incidencia.sprint, true)}
                </select>
            </td>
        </tr>`).join("");

    $("#vista").innerHTML = `
        <div class="encabezado-vista">
            <div>
                <h1>Backlog</h1>
                <p>Todas las incidencias del proyecto. Asigna cada documento al sprint en el que se va a trabajar.</p>
            </div>
            <button class="btn btn-primario" id="btn-nueva" type="button">Nueva incidencia</button>
        </div>
        <div class="tabla-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Clave</th><th>Título</th><th>Encargado</th><th>Fechas</th><th>Tipo</th><th>Prioridad</th><th>Puntos</th><th>Estado</th><th>Sprint</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="9" class="vacio">No hay incidencias con ese criterio.</td></tr>'}
                </tbody>
            </table>
        </div>`;

    $("#btn-nueva").addEventListener("click", abrirModalNueva);
    document.querySelectorAll(".enlace-issue").forEach(btn => {
        btn.addEventListener("click", () => abrirIncidencia(btn.dataset.id));
    });
    document.querySelectorAll(".mover-sprint").forEach(select => {
        select.addEventListener("change", () => {
            const incidencia = estado.incidencias.find(i => i.id === select.dataset.id);
            incidencia.sprint = select.value || null;
            guardar();
            renderNav();
        });
    });
}

function progreso(sprintId) {
    const items = estado.incidencias.filter(i => i.sprint === sprintId);
    if (!items.length) return 0;
    const hechos = items.filter(i => i.estado === "done").length;
    return Math.round((hechos / items.length) * 100);
}

function renderSprints() {
    const tarjetas = estado.sprints.map(sprint => {
        const items = estado.incidencias.filter(i => i.sprint === sprint.id);
        const puntos = items.reduce((suma, i) => suma + Number(i.puntos || 0), 0);
        return `
            <article class="sprint-card">
                <span class="estado-sprint ${sprint.estado}">${escapar(sprint.estado)}</span>
                <h2>${escapar(sprint.nombre)}</h2>
                <span class="fechas-sprint">${escapar(rangoFechas(sprint))}</span>
                <p>${escapar(sprint.meta || "Sin meta definida.")}</p>
                <div class="barra" aria-hidden="true"><span style="width:${progreso(sprint.id)}%"></span></div>
                <div class="sprint-stats">
                    <span><b>${items.length}</b> incidencias</span>
                    <span><b>${puntos}</b> puntos</span>
                    <span><b>${progreso(sprint.id)}%</b> hecho</span>
                </div>
                <div class="fila-controles">
                    ${sprint.estado !== "activo" ? `<button class="btn" data-activar="${sprint.id}" type="button">Marcar activo</button>` : ""}
                    ${sprint.estado !== "cerrado" ? `<button class="btn" data-cerrar="${sprint.id}" type="button">Cerrar sprint</button>` : ""}
                    <button class="btn" data-ver="${sprint.id}" type="button">Ver tablero</button>
                </div>
            </article>`;
    }).join("");

    $("#vista").innerHTML = `
        <div class="encabezado-vista">
            <div>
                <h1>Sprints</h1>
                <p>Cada sprint agrupa los documentos que el equipo va a producir o revisar en esa iteración.</p>
            </div>
            <button class="btn btn-primario" id="btn-sprint" type="button">Nuevo sprint</button>
        </div>
        <div class="rejilla-sprints">${tarjetas}</div>`;

    $("#btn-sprint").addEventListener("click", abrirModalSprint);
    document.querySelectorAll("[data-activar]").forEach(btn => {
        btn.addEventListener("click", () => {
            estado.sprints.forEach(s => { if (s.estado === "activo") s.estado = "planificado"; });
            estado.sprints.find(s => s.id === btn.dataset.activar).estado = "activo";
            guardar();
            render();
        });
    });
    document.querySelectorAll("[data-cerrar]").forEach(btn => {
        btn.addEventListener("click", () => {
            const sprint = estado.sprints.find(s => s.id === btn.dataset.cerrar);
            const pendientes = estado.incidencias.filter(i => i.sprint === sprint.id && i.estado !== "done");
            pendientes.forEach(i => { i.sprint = null; });
            sprint.estado = "cerrado";
            guardar();
            render();
        });
    });
    document.querySelectorAll("[data-ver]").forEach(btn => {
        btn.addEventListener("click", () => {
            vista = "tablero";
            render();
            const select = $("#sprint-tablero");
            if (select) {
                select.value = btn.dataset.ver;
                render();
            }
        });
    });
}

function renderDocumentos() {
    const grupos = [
        { titulo: "Semana 1 · Sprint 1", filtro: (item) => item.semana === "Semana 1" },
        { titulo: "Semana 2 · Sprint 2", filtro: (item) => item.semana === "Semana 2" },
        { titulo: "Semana 3 · Sprint 3", filtro: (item) => item.semana === "Semana 3" },
        { titulo: "Semana 4 · Sprint 4 · Validación", filtro: (item) => item.semana === "Semana 4" },
        { titulo: "Sin semana asignada", filtro: (item) => !item.semana }
    ];

    const html = grupos.map(grupo => {
        const items = window.CATALOGO.filter(grupo.filtro).filter(item => {
            if (!filtroTexto) return true;
            return normalizar(item.nombre).includes(filtroTexto);
        });
        if (!items.length) return "";
        const cards = items.map(item => {
            const incidencia = estado.incidencias.find(i => i.archivo === item.archivo);
            return `
                <article class="doc-card">
                    <span class="tipo">${escapar(tipoDeArchivo(item.archivo))}</span>
                    <h3>${escapar(item.nombre)}</h3>
                    <p class="clave">${incidencia ? escapar(incidencia.id) + " · " + escapar(nombreSprint(incidencia.sprint)) + " · " + escapar(cortoResponsable(incidencia.responsable)) : ""}</p>
                    <div class="fila-controles">
                        <button class="btn" data-archivo="${escapar(item.archivo)}" type="button">Abrir incidencia</button>
                        <a class="btn" href="${encodeURI(item.archivo)}" download>Descargar</a>
                    </div>
                </article>`;
        }).join("");
        return `<section class="grupo"><h2>${grupo.titulo}</h2><div class="documentos">${cards}</div></section>`;
    }).join("");

    $("#vista").innerHTML = `
        <div class="encabezado-vista">
            <div>
                <h1>Documentos</h1>
                <p>Repositorio original. Cada archivo ya es una incidencia y puede entrar a un sprint desde el backlog.</p>
            </div>
        </div>
        ${html || '<div class="vacio">No hay documentos con ese criterio.</div>'}`;

    document.querySelectorAll("[data-archivo]").forEach(btn => {
        btn.addEventListener("click", () => {
            const incidencia = estado.incidencias.find(i => i.archivo === btn.dataset.archivo);
            if (incidencia) abrirIncidencia(incidencia.id);
        });
    });
}

let filtroResponsable = "";

function renderCronograma() {
    const DW = 34;
    const lista = incidenciasVisibles().filter(i => i.inicio && i.fin && (!filtroResponsable || i.responsable === filtroResponsable));
    const sprintsConFechas = estado.sprints.filter(x => x.inicio && x.fin);
    const marcas = [];
    lista.forEach(i => marcas.push(aMs(i.inicio), aMs(i.fin)));
    sprintsConFechas.forEach(x => marcas.push(aMs(x.inicio), aMs(x.fin)));

    if (!marcas.length) {
        $("#vista").innerHTML = `<div class="encabezado-vista"><div><h1>Cronograma</h1><p>Aún no hay incidencias con fechas.</p></div></div><div class="vacio">Asigna fecha de inicio y fin en cada incidencia para verla aquí.</div>`;
        return;
    }

    const desde = Math.min(...marcas) - DIA;
    const hasta = Math.max(...marcas) + DIA;
    const dias = Math.round((hasta - desde) / DIA) + 1;
    const ancho = dias * DW;
    const hoy = Date.parse(aISO(Date.now()) + "T00:00:00Z");
    const x = (ms) => Math.round((ms - desde) / DIA) * DW;

    // cabecera: meses y días
    const meses = [];
    const celdas = [];
    const fondo = [];
    for (let d = 0; d < dias; d++) {
        const ms = desde + d * DIA;
        const f = new Date(ms);
        const mesTxt = f.toLocaleDateString("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).replace(" de ", " ");
        const mes = mesTxt.charAt(0).toUpperCase() + mesTxt.slice(1);
        if (!meses.length || meses[meses.length - 1].mes !== mes) meses.push({ mes, dias: 0 });
        meses[meses.length - 1].dias += 1;
        const dow = f.getUTCDay();
        const finde = dow === 0 || dow === 6;
        celdas.push(`<span class="g-dia ${finde ? "finde" : ""} ${ms === hoy ? "es-hoy" : ""}"><small>${"DLMMJVS"[dow]}</small><b>${f.getUTCDate()}</b></span>`);
        if (finde) fondo.push(`<i class="g-finde" style="left:${d * DW}px;width:${DW}px"></i>`);
    }
    if (hoy >= desde && hoy <= hasta) fondo.push(`<i class="g-hoy" style="left:${x(hoy) + DW / 2}px"></i>`);
    const fondoHtml = fondo.join("");

    const filas = [];
    const barra = (inicio, fin, clase, texto, extra) => {
        const izq = x(aMs(inicio));
        const w = Math.max(DW - 2, x(aMs(fin)) - izq + DW - 2);
        return `<button type="button" class="g-barra ${clase}" style="left:${izq + 1}px;width:${w}px" ${extra}>${texto}</button>`;
    };
    const fila = (etiqueta, pista, clase) => `
        <div class="g-fila ${clase || ""}" style="grid-template-columns:270px ${ancho}px">
            <div class="g-etiqueta">${etiqueta}</div>
            <div class="g-pista" style="background-size:${DW}px 100%">${fondoHtml}${pista}</div>
        </div>`;

    const grupos = estado.sprints.map(sp => ({ sprint: sp, items: lista.filter(i => i.sprint === sp.id) }));
    grupos.push({ sprint: null, items: lista.filter(i => !i.sprint) });

    grupos.forEach(grupo => {
        const hayFiltro = filtroTexto || filtroResponsable;
        if (hayFiltro && !grupo.items.length) return;
        if (!grupo.sprint && !grupo.items.length) return;
        if (grupo.sprint) {
            const sp = grupo.sprint;
            const pista = sp.inicio && sp.fin ? barra(sp.inicio, sp.fin, "g-sprint " + sp.estado, escapar(sp.nombre), `title="${escapar(sp.nombre + " · " + rangoFechas(sp))}" tabindex="-1"`) : "";
            filas.push(fila(`<strong>${escapar(sp.nombre)}</strong><span class="g-sub">${escapar(rangoFechas(sp))} · ${progreso(sp.id)}% hecho</span>`, pista, "g-grupo"));
        } else {
            filas.push(fila(`<strong>Backlog</strong><span class="g-sub">Con fechas, sin sprint</span>`, "", "g-grupo"));
        }
        grupo.items.forEach(i => {
            const tip = `${i.id} · ${i.titulo}\n${nombreResponsable(i.responsable)}\n${rangoFechas(i)} · ${nombreEstado(i.estado)}`;
            const pista = barra(i.inicio, i.fin, "e-" + i.estado, `${avatar(i.responsable)}<span>${escapar(i.titulo)}</span>`, `data-id="${i.id}" title="${escapar(tip)}"`);
            filas.push(fila(`<span class="clave">${escapar(i.id)}</span><span class="g-titulo">${escapar(i.titulo)}</span><span class="g-sub">${escapar(cortoResponsable(i.responsable))} · ${escapar(rangoFechas(i))}</span>`, pista));
        });
    });

    const leyenda = ESTADOS.map(e => `<span><i class="sw e-${e.id}"></i>${e.nombre}</span>`).join("") + `<span><i class="sw g-hoy-sw"></i>Hoy</span>`;
    const sinFechas = incidenciasVisibles().filter(i => !i.inicio || !i.fin).length;

    $("#vista").innerHTML = `
        <div class="encabezado-vista">
            <div>
                <h1>Cronograma</h1>
                <p>Vista tipo Gantt de los sprints y sus incidencias. Haz clic en una barra para editar fechas y encargado.</p>
            </div>
            <div class="fila-controles">
                <select class="filtro" id="filtro-responsable" aria-label="Filtrar por encargado">${opcionesResponsable(filtroResponsable, true)}</select>
            </div>
        </div>
        <div class="g-leyenda">${leyenda}${sinFechas ? `<span class="g-aviso">${sinFechas} sin fechas (no se dibujan)</span>` : ""}</div>
        <div class="gantt" id="gantt">
            <div class="g-fila g-cabeza" style="grid-template-columns:270px ${ancho}px">
                <div class="g-etiqueta">Incidencia</div>
                <div class="g-escala">
                    <div class="g-meses">${meses.map(m => `<span style="width:${m.dias * DW}px">${escapar(m.mes)}</span>`).join("")}</div>
                    <div class="g-dias">${celdas.join("")}</div>
                </div>
            </div>
            ${filas.join("")}
        </div>`;

    $("#filtro-responsable").addEventListener("change", (e) => { filtroResponsable = e.target.value; render(); });
    document.querySelectorAll(".g-barra[data-id]").forEach(b => b.addEventListener("click", () => abrirIncidencia(b.dataset.id)));
    const contenedor = $("#gantt");
    if (hoy >= desde && hoy <= hasta) contenedor.scrollLeft = Math.max(0, x(hoy) - 200);
}

function render() {
    renderNav();
    if (vista === "tablero") renderTablero();
    else if (vista === "backlog") renderBacklog();
    else if (vista === "sprints") renderSprints();
    else if (vista === "cronograma") renderCronograma();
    else renderDocumentos();
}

function cerrarOverlay() {
    const overlay = $("#overlay");
    if (overlay) overlay.remove();
    incidenciaAbierta = null;
}

function vistaPrevia(incidencia) {
    if (!incidencia.archivo) return "";
    const ruta = encodeURI(incidencia.archivo);
    if (/\.(png|jpe?g|webp|svg)$/i.test(incidencia.archivo)) {
        return `<div class="visor-mini"><img src="${ruta}" alt="${escapar(incidencia.titulo)}"></div>`;
    }
    if (/\.pdf$/i.test(incidencia.archivo)) {
        return `<div class="visor-mini"><iframe title="${escapar(incidencia.titulo)}" src="${ruta}"></iframe></div>
            <a class="btn" href="${ruta}" target="_blank" rel="noopener">Abrir PDF en otra pestaña</a>`;
    }
    return `<p class="aviso">Este formato no se previsualiza en el navegador. Puedes descargarlo y seguir usándolo como incidencia del sprint.</p>
        <a class="btn" href="${ruta}" download>Descargar archivo</a>`;
}

function abrirIncidencia(id) {
    const incidencia = estado.incidencias.find(i => i.id === id);
    if (!incidencia) return;
    incidenciaAbierta = id;
    cerrarOverlay();

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "overlay";
    overlay.innerHTML = `
        <aside class="panel" role="dialog" aria-labelledby="titulo-panel">
            <div class="panel-cabeza">
                <span class="clave">${escapar(incidencia.id)}</span>
                <h2 id="titulo-panel">Incidencia</h2>
                <button class="btn" id="cerrar-panel" type="button">Cerrar</button>
            </div>
            <div class="panel-cuerpo">
                <div class="form-grid">
                    <div class="campo-grupo ancho">
                        <label for="edit-titulo">Título</label>
                        <input class="campo" id="edit-titulo" value="${escapar(incidencia.titulo)}">
                    </div>
                    <div class="campo-grupo ancho">
                        <label for="edit-desc">Descripción</label>
                        <textarea class="campo" id="edit-desc">${escapar(incidencia.descripcion || "")}</textarea>
                    </div>
                    <div class="campo-grupo">
                        <label for="edit-estado">Estado</label>
                        <select class="filtro" id="edit-estado">${opcionesEstado(incidencia.estado)}</select>
                    </div>
                    <div class="campo-grupo">
                        <label for="edit-sprint">Sprint</label>
                        <select class="filtro" id="edit-sprint">${opcionesSprint(incidencia.sprint, true)}</select>
                    </div>
                    <div class="campo-grupo">
                        <label for="edit-prioridad">Prioridad</label>
                        <select class="filtro" id="edit-prioridad">${opcionesPrioridad(incidencia.prioridad)}</select>
                    </div>
                    <div class="campo-grupo">
                        <label for="edit-puntos">Puntos</label>
                        <input class="campo" id="edit-puntos" type="number" min="1" max="21" value="${incidencia.puntos}">
                    </div>
                    <div class="campo-grupo ancho">
                        <label for="edit-responsable">Encargado</label>
                        <select class="filtro" id="edit-responsable">${opcionesResponsable(incidencia.responsable, false)}</select>
                    </div>
                    <div class="campo-grupo">
                        <label for="edit-inicio">Fecha de inicio</label>
                        <input class="campo" id="edit-inicio" type="date" value="${incidencia.inicio || ""}">
                    </div>
                    <div class="campo-grupo">
                        <label for="edit-fin">Fecha de fin</label>
                        <input class="campo" id="edit-fin" type="date" value="${incidencia.fin || ""}">
                    </div>
                </div>
                ${vistaPrevia(incidencia)}
                <div class="fila-controles">
                    <button class="btn btn-primario" id="guardar-issue" type="button">Guardar</button>
                    <button class="btn btn-peligro" id="borrar-issue" type="button">Quitar del tablero</button>
                </div>
            </div>
        </aside>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) cerrarOverlay();
    });
    $("#cerrar-panel").addEventListener("click", cerrarOverlay);
    $("#guardar-issue").addEventListener("click", () => {
        incidencia.titulo = $("#edit-titulo").value.trim() || incidencia.titulo;
        incidencia.descripcion = $("#edit-desc").value.trim();
        incidencia.estado = $("#edit-estado").value;
        incidencia.sprint = $("#edit-sprint").value || null;
        incidencia.prioridad = $("#edit-prioridad").value;
        incidencia.puntos = Math.max(1, Number($("#edit-puntos").value) || 1);
        incidencia.responsable = $("#edit-responsable").value || null;
        incidencia.inicio = $("#edit-inicio").value || null;
        incidencia.fin = $("#edit-fin").value || null;
        if (incidencia.inicio && incidencia.fin && incidencia.fin < incidencia.inicio) incidencia.fin = incidencia.inicio;
        guardar();
        cerrarOverlay();
        render();
    });
    $("#borrar-issue").addEventListener("click", () => {
        estado.incidencias = estado.incidencias.filter(i => i.id !== incidencia.id);
        guardar();
        cerrarOverlay();
        render();
    });
}

function abrirModalNueva() {
    cerrarOverlay();
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "overlay";
    overlay.innerHTML = `
        <div class="modal-caja" role="dialog" aria-labelledby="titulo-nueva">
            <h2 id="titulo-nueva">Nueva incidencia</h2>
            <div class="form-grid">
                <div class="campo-grupo ancho">
                    <label for="nueva-titulo">Título</label>
                    <input class="campo" id="nueva-titulo" placeholder="Ej. Revisar diagrama de secuencia">
                </div>
                <div class="campo-grupo">
                    <label for="nueva-tipo">Tipo</label>
                    <select class="filtro" id="nueva-tipo">
                        <option>Tarea</option><option>Documento</option><option>Diagrama</option><option>Historia</option>
                    </select>
                </div>
                <div class="campo-grupo">
                    <label for="nueva-prioridad">Prioridad</label>
                    <select class="filtro" id="nueva-prioridad">${opcionesPrioridad("media")}</select>
                </div>
                <div class="campo-grupo">
                    <label for="nueva-sprint">Sprint</label>
                    <select class="filtro" id="nueva-sprint">${opcionesSprint(sprintActivo() ? sprintActivo().id : "", true)}</select>
                </div>
                <div class="campo-grupo">
                    <label for="nueva-puntos">Puntos</label>
                    <input class="campo" id="nueva-puntos" type="number" min="1" max="21" value="3">
                </div>
                <div class="campo-grupo ancho">
                    <label for="nueva-responsable">Encargado</label>
                    <select class="filtro" id="nueva-responsable">${opcionesResponsable("", false)}</select>
                </div>
                <div class="campo-grupo">
                    <label for="nueva-inicio">Fecha de inicio</label>
                    <input class="campo" id="nueva-inicio" type="date" value="${sprintActivo() ? sprintActivo().inicio || "" : ""}">
                </div>
                <div class="campo-grupo">
                    <label for="nueva-fin">Fecha de fin</label>
                    <input class="campo" id="nueva-fin" type="date" value="${sprintActivo() ? sprintActivo().fin || "" : ""}">
                </div>
            </div>
            <div class="fila-controles" style="margin-top:14px">
                <button class="btn btn-primario" id="crear-issue" type="button">Crear</button>
                <button class="btn" id="cerrar-panel" type="button">Cancelar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (evento) => { if (evento.target === overlay) cerrarOverlay(); });
    $("#cerrar-panel").addEventListener("click", cerrarOverlay);
    $("#crear-issue").addEventListener("click", () => {
        const titulo = $("#nueva-titulo").value.trim();
        if (!titulo) {
            $("#nueva-titulo").focus();
            return;
        }
        estado.incidencias.push({
            id: "PL-" + estado.siguiente,
            titulo,
            descripcion: "",
            tipo: $("#nueva-tipo").value,
            archivo: null,
            sprint: $("#nueva-sprint").value || null,
            estado: "todo",
            prioridad: $("#nueva-prioridad").value,
            puntos: Math.max(1, Number($("#nueva-puntos").value) || 1),
            responsable: $("#nueva-responsable").value || null,
            inicio: $("#nueva-inicio").value || null,
            fin: $("#nueva-fin").value >= $("#nueva-inicio").value ? ($("#nueva-fin").value || null) : $("#nueva-inicio").value
        });
        estado.siguiente += 1;
        guardar();
        cerrarOverlay();
        render();
    });
}

function ultimoFin() {
    const fines = estado.sprints.map(x => x.fin).filter(Boolean).sort();
    return fines.length ? fines[fines.length - 1] : "";
}

function abrirModalSprint() {
    cerrarOverlay();
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "overlay";
    overlay.innerHTML = `
        <div class="modal-caja" role="dialog" aria-labelledby="titulo-sprint">
            <h2 id="titulo-sprint">Nuevo sprint</h2>
            <div class="form-grid">
                <div class="campo-grupo ancho">
                    <label for="sprint-nombre">Nombre</label>
                    <input class="campo" id="sprint-nombre" placeholder="Sprint 5">
                </div>
                <div class="campo-grupo ancho">
                    <label for="sprint-meta">Meta</label>
                    <textarea class="campo" id="sprint-meta" placeholder="Qué se va a entregar en esta iteración"></textarea>
                </div>
                <div class="campo-grupo">
                    <label for="sprint-inicio">Fecha de inicio</label>
                    <input class="campo" id="sprint-inicio" type="date" value="${ultimoFin()}">
                </div>
                <div class="campo-grupo">
                    <label for="sprint-fin">Fecha de fin</label>
                    <input class="campo" id="sprint-fin" type="date" value="${ultimoFin() ? aISO(aMs(ultimoFin()) + 7 * DIA) : ""}">
                </div>
            </div>
            <div class="fila-controles" style="margin-top:14px">
                <button class="btn btn-primario" id="crear-sprint" type="button">Crear sprint</button>
                <button class="btn" id="cerrar-panel" type="button">Cancelar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (evento) => { if (evento.target === overlay) cerrarOverlay(); });
    $("#cerrar-panel").addEventListener("click", cerrarOverlay);
    $("#crear-sprint").addEventListener("click", () => {
        const nombre = $("#sprint-nombre").value.trim();
        if (!nombre) {
            $("#sprint-nombre").focus();
            return;
        }
        const id = "s" + Date.now();
        estado.sprints.push({
            id,
            nombre,
            meta: $("#sprint-meta").value.trim(),
            inicio: $("#sprint-inicio").value || null,
            fin: $("#sprint-fin").value || null,
            estado: "planificado"
        });
        guardar();
        cerrarOverlay();
        render();
    });
}

function iniciar() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            vista = btn.dataset.vista;
            render();
        });
    });

    $("#busqueda").addEventListener("input", () => {
        filtroTexto = normalizar($("#busqueda").value.trim());
        render();
    });

    $("#btn-restablecer").addEventListener("click", () => {
        localStorage.removeItem(CLAVE_STORAGE);
        const fresco = semilla();
        estado.sprints = fresco.sprints;
        estado.incidencias = fresco.incidencias;
        estado.siguiente = fresco.siguiente;
        render();
    });

    render();
}

document.addEventListener("DOMContentLoaded", iniciar);
