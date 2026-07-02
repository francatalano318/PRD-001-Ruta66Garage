# PRD-001: Ruta 66 Garage - Sistema de Órdenes de Trabajo para Talleres Mecánicos con Clasificación Automática mediante IA

## Contexto y Problema
Los talleres mecánicos registran órdenes de trabajo para documentar averias reportadas por los clientes y para realizar el seguimiento de las reparaciones. El tiempo que demora la clasificacion de estos problemas y la prioridad asignada puede variar segun la experiencia del operador. 

Personas:
- Usuario de Taller: Quiere registrar su trabajo de forma eficiente y poder darle un seguimiento.

## Objetivos
Que una órden de trabajo entre y salga clasificada en segundos, dejando al humano solo para revisar, ajustar y registrar. Reducir el tiempo de registro, mejorar los diagnosticos y los tiempos de espera para el cliente del taller.

# Requerimientos Funcionales

### RF-01

El sistema debe permitir que un usuario inicie sesión mediante correo electrónico y contraseña.

### RF-02

El sistema debe impedir el acceso a funcionalidades protegidas a usuarios no autenticados.


### RF-03

El sistema debe permitir crear una orden de trabajo ingresando cliente, patente y descripción de la incidencia.

### RF-04

El sistema debe asignar un identificador único a cada orden creada.

### RF-05

El sistema debe asignar el estado inicial "Abierta" a toda orden creada.


### RF-06

El sistema debe clasificar automáticamente la incidencia en una de las siguientes categorías:

* Motor
* Frenos
* Suspensión
* Dirección
* Electricidad
* Transmisión
* Otro

### RF-07

El sistema debe asignar automáticamente una prioridad inicial entre:

* Alta
* Media
* Baja

### RF-08

El sistema debe permitir modificar la categoría asignada automáticamente.

### RF-09

El sistema debe permitir modificar la prioridad asignada automáticamente.

### RF-10

El sistema debe indicar visualmente cuando una categoría fue asignada por IA.

### RF-11

El sistema debe indicar visualmente cuando una prioridad fue asignada por IA.


### RF-12

El sistema debe mostrar un listado paginado de órdenes de trabajo.

### RF-13

El sistema debe permitir filtrar órdenes por estado.

### RF-14

El sistema debe permitir filtrar órdenes por categoría.

### RF-15

El sistema debe permitir filtrar órdenes por prioridad.

### RF-16

El sistema debe permitir visualizar el detalle completo de una orden.

### RF-17

El sistema debe permitir cambiar el estado de una orden.

Estados permitidos:

* Abierta
* En diagnóstico
* Reparando
* Finalizada

### RF-18

El sistema debe registrar fecha y hora de cada cambio de estado.

### RF-19

El sistema debe permitir agregar observaciones a una orden.

---

### RF-20

El sistema debe impedir la creación de una orden cuando la patente esté vacía.

### RF-21

El sistema debe impedir la creación de una orden cuando la descripción tenga menos de 10 caracteres.

### RF-22

El sistema debe informar al usuario cuando la clasificación automática no pueda completarse.

---

# Requerimientos No Funcionales

### RNF-01

El inicio de sesión debe completarse en menos de 2 segundos en el 95% de los casos.

### RNF-02

La creación de una orden debe completarse en menos de 3 segundos en el 95% de los casos.

### RNF-03

La clasificación automática debe completarse en menos de 5 segundos en el 95% de los casos.

### RNF-04

La precisión de clasificación automática debe ser mayor o igual al 80% sobre un conjunto de prueba de al menos 100 incidencias etiquetadas.

### RNF-05

La consulta de una página de órdenes debe completarse en menos de 2 segundos en el 95% de los casos.

### RNF-06

La disponibilidad mensual del sistema debe ser mayor o igual al 99%.

### RNF-07

Las fechas y horas registradas por el sistema deben almacenarse con precisión de segundos.

### RNF-08

Cada página del listado debe contener un máximo de 20 órdenes.

---

# Criterios de Aceptación

## AC-01 (RF-01)

**Dado** un usuario registrado con credenciales válidas
**Cuando** ingresa correo electrónico y contraseña correctos
**Entonces** el sistema permite el acceso.

---

## AC-02 (RF-02)

**Dado** un usuario no autenticado
**Cuando** intenta acceder al listado de órdenes
**Entonces** el sistema deniega el acceso.

---

## AC-03 (RF-03)

**Dado** que el usuario completa cliente, patente y descripción válidos
**Cuando** selecciona "Crear Orden"
**Entonces** el sistema crea la orden.

---

## AC-04 (RF-04)

**Dado** una nueva orden creada
**Cuando** finaliza la creación
**Entonces** la orden posee un identificador único.

---

## AC-05 (RF-05)

**Dado** una nueva orden creada
**Cuando** finaliza la creación
**Entonces** el estado asignado es "Abierta".

---

## AC-06 (RF-06)

**Dado** la descripción "el vehículo hace ruido al frenar"
**Cuando** se crea la orden
**Entonces** la categoría asignada es "Frenos".

---

## AC-07 (RF-07)

**Dado** la descripción "el vehículo no responde al pedal de freno"
**Cuando** se crea la orden
**Entonces** la prioridad asignada es "Alta".

---

## AC-08 (RF-08)

**Dado** una orden con categoría "Motor"
**Cuando** el usuario cambia la categoría a "Electricidad"
**Entonces** la categoría almacenada es "Electricidad".

---

## AC-09 (RF-09)

**Dado** una orden con prioridad "Media"
**Cuando** el usuario cambia la prioridad a "Alta"
**Entonces** la prioridad almacenada es "Alta".

---

## AC-10 (RF-10)

**Dado** una orden clasificada por IA
**Cuando** el usuario visualiza el detalle
**Entonces** el sistema muestra el indicador "Categoría asignada por IA".

---

## AC-11 (RF-11)

**Dado** una orden priorizada por IA
**Cuando** el usuario visualiza el detalle
**Entonces** el sistema muestra el indicador "Prioridad asignada por IA".

---

## AC-12 (RF-12)

**Dado** que existen más de 20 órdenes registradas
**Cuando** el usuario accede al listado
**Entonces** el sistema muestra un máximo de 20 órdenes en la página actual.

---

## AC-13 (RF-13)

**Dado** órdenes con distintos estados
**Cuando** el usuario filtra por "Reparando"
**Entonces** solo se muestran órdenes con estado "Reparando".

---

## AC-14 (RF-14)

**Dado** órdenes con distintas categorías
**Cuando** el usuario filtra por "Frenos"
**Entonces** solo se muestran órdenes con categoría "Frenos".

---

## AC-15 (RF-15)

**Dado** órdenes con distintas prioridades
**Cuando** el usuario filtra por "Alta"
**Entonces** solo se muestran órdenes con prioridad "Alta".

---

## AC-16 (RF-16)

**Dado** una orden existente
**Cuando** el usuario selecciona la orden
**Entonces** el sistema muestra cliente, patente, descripción, categoría, prioridad, estado y observaciones.

---

## AC-17 (RF-17)

**Dado** una orden con estado "Abierta"
**Cuando** el usuario cambia el estado a "En diagnóstico"
**Entonces** el nuevo estado almacenado es "En diagnóstico".

---

## AC-18 (RF-18)

**Dado** una orden existente
**Cuando** el usuario cambia el estado
**Entonces** el sistema registra fecha y hora del cambio.

---

## AC-19 (RF-19)

**Dado** una orden existente
**Cuando** el usuario agrega una observación
**Entonces** la observación queda almacenada.

---

## AC-20 (RF-20)

**Dado** que el campo patente está vacío
**Cuando** el usuario intenta crear la orden
**Entonces** el sistema rechaza la operación indicando que la patente es obligatoria.

---

## AC-21 (RF-21)

**Dado** una descripción de menos de 10 caracteres
**Cuando** el usuario intenta crear la orden
**Entonces** el sistema rechaza la operación indicando que la descripción es inválida.

---

## AC-22 (RF-22)

**Dado** una falla del servicio de clasificación automática
**Cuando** se intenta crear una orden
**Entonces** el sistema informa que la clasificación automática no pudo completarse.

---

# Fuera de Alcance

* Gestión de stock de repuestos.
* Facturación.
* Emisión de presupuestos.
* Agenda de turnos.
* Notificaciones por correo electrónico.
* Notificaciones por WhatsApp.
* Integración con proveedores.
* Integración con sistemas ERP.
* Aplicación móvil.
* Diagnóstico automático de fallas.
* Generación automática de presupuestos.
* Gestión avanzada de clientes.

---

# Riesgos y Dependencias

## R-01

La IA puede clasificar incorrectamente incidencias ambiguas.

## R-02

Los usuarios pueden ingresar descripciones insuficientes para una clasificación precisa.

## R-03

La indisponibilidad del servicio de IA puede impedir la clasificación automática.

## R-04

El conjunto de prueba utilizado para medir precisión puede no representar casos reales del taller.

---


## D-01

Base de datos para almacenamiento de órdenes.

## D-02

Servicio de autenticación de usuarios.

## D-03

Servicio de inteligencia artificial para clasificación y priorización.

## D-04

Conectividad de red entre la aplicación y el servicio de IA.

## D-05

Navegador web compatible con HTML5.

