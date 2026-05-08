# Technical Specification

## Vision

Plataforma web de juego de damas en línea que permite a dos jugadores conectarse desde cualquier lugar del mundo y disputar una partida en tiempo real. El sistema ofrece un tablero interactivo con validaciones completas de las reglas del juego, garantizando una experiencia auténtica y justa. El propósito central es democratizar el acceso al juego de damas clásico mediante tecnología web moderna.

## Target Users

Los usuarios objetivo son jugadores casuales y entusiastas del juego de damas que desean competir contra otras personas a través de Internet. Su contexto es el juego recreativo desde dispositivos con navegador web, sin necesidad de instalación de software adicional. Su principal problema es la falta de plataformas simples y accesibles para jugar damas en línea con un oponente real.

## Features

- El usuario puede registrar su nombre para identificarse en la sesión de juego antes de iniciar una partida.
- El sistema permite crear una sala de juego privada y generar un código o enlace único para invitar al oponente.
- El usuario puede unirse a una sala existente ingresando el código de invitación proporcionado por el anfitrión.
- El sistema permite seleccionar una pieza válida del tablero y visualizar los movimientos legales disponibles para esa pieza.
- El usuario puede mover una pieza de una casilla a otra siguiendo todas las reglas oficiales del juego de damas, incluyendo capturas simples y capturas múltiples.
- El sistema permite coronar automáticamente una pieza cuando alcanza la fila contraria, convirtiéndola en dama con capacidad de movimiento extendido.
- El sistema permite detectar automáticamente la condición de fin de partida y mostrar el resultado declarando al ganador o empate.
- El usuario puede ver el historial de turnos y el estado actualizado del tablero en tiempo real durante toda la partida.

## User Flows

### Flow 1: Registro y creación de sala

**Happy path**

1. El jugador accede a la aplicación web e ingresa su nombre en el formulario de registro.
2. El sistema valida que el nombre no esté vacío y crea una nueva sala de juego con un código único.
3. El sistema muestra el código de sala y un enlace de invitación para compartir con el oponente.
4. El jugador anfitrión queda en estado de espera visualizando una pantalla de sala de espera.

**Error path:** Si el nombre está vacío o contiene caracteres inválidos, el sistema muestra un mensaje de error y solicita corrección. Si el servidor falla al crear la sala, se muestra un aviso de error de conexión y se ofrece reintentar.

### Flow 2: Unión del oponente a la sala

**Happy path**

1. El segundo jugador accede al enlace de invitación o ingresa manualmente el código de sala.
2. El jugador ingresa su nombre en el formulario de registro.
3. El sistema valida el código de sala, registra al segundo jugador y notifica a ambos participantes.
4. El sistema inicia la partida mostrando el tablero con las piezas en posición inicial y asignando colores a cada jugador.

**Error path:** Si el código de sala es inválido o la sala ya está completa, el sistema muestra un mensaje de error descriptivo. Si ocurre un problema de red durante la conexión, el sistema intenta reconectar automáticamente y notifica al usuario.

### Flow 3: Movimiento de pieza

**Happy path**

1. El jugador activo selecciona una de sus piezas haciendo clic sobre ella en el tablero.
2. El sistema resalta la pieza seleccionada y muestra las casillas disponibles para mover según las reglas del juego.
3. El jugador hace clic en una casilla destino válida para ejecutar el movimiento.
4. El sistema valida el movimiento, actualiza el estado del tablero en tiempo real para ambos jugadores y cambia el turno al oponente.

**Error path:** Si el jugador intenta mover una pieza del oponente o hacer un movimiento inválido, el sistema ignora la acción y muestra un mensaje de advertencia. Si se pierde la conexión durante el movimiento, el sistema notifica al jugador y suspende el juego hasta reconectar.

### Flow 4: Captura de piezas

**Happy path**

1. El jugador activo selecciona una pieza que tiene la posibilidad de capturar una pieza rival.
2. El sistema resalta las capturas disponibles; si existe captura obligatoria, solo muestra movimientos de captura.
3. El jugador ejecuta el salto sobre la pieza rival seleccionando la casilla destino.
4. El sistema elimina la pieza capturada del tablero, verifica si hay capturas múltiples encadenadas disponibles y, de existir, fuerza al jugador a continuar la secuencia.

**Error path:** Si el jugador intenta moverse sin realizar una captura obligatoria, el sistema bloquea el movimiento y muestra una advertencia indicando la captura forzada. En caso de desconexión durante una captura múltiple, el estado se conserva en el servidor hasta que el jugador reconecte.

### Flow 5: Fin de partida

**Happy path**

1. El sistema detecta que un jugador no tiene piezas restantes o no puede realizar ningún movimiento válido.
2. El sistema detiene el juego, deshabilita la interacción con el tablero y determina al ganador.
3. Se muestra una pantalla de resultados con el nombre del ganador y un resumen de la partida.
4. Se ofrece a ambos jugadores la opción de iniciar una nueva partida o regresar a la pantalla principal.

**Error path:** Si ocurre una desconexión justo al detectarse el fin de partida, el resultado se almacena temporalmente en el servidor y se muestra al reconectarse. Si ambos jugadores abandonan la sala antes de finalizar, la sala se elimina automáticamente tras un tiempo de inactividad.

## Architecture

La aplicación utilizará una arquitectura cliente-servidor con un frontend desarrollado en React.js para el renderizado del tablero interactivo y la gestión del estado visual del juego. El backend estará construido con Node.js y Express, incorporando Socket.IO para la comunicación bidireccional en tiempo real entre los dos jugadores. El estado del juego y las salas activas se gestionarán en memoria del servidor con Redis como soporte opcional para persistencia de sesiones. El despliegue se realizará en una plataforma cloud como Railway o Render, garantizando disponibilidad y escalabilidad básica.

## Requirements

El sistema debe soportar partidas simultáneas entre múltiples pares de jugadores sin interferencia entre salas. La latencia en la sincronización de movimientos entre los dos clientes no debe superar los 300ms en condiciones normales de red. Las validaciones de reglas del juego de damas, incluyendo movimiento obligatorio de captura, coronación y capturas múltiples, deben aplicarse exclusivamente en el servidor para prevenir trampas. La aplicación debe ser responsiva y funcionar correctamente en navegadores modernos tanto en escritorio como en dispositivos móviles.