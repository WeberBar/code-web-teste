# Firmware do MicroPython (ESP32)

O binário de release do MicroPython fica aqui, com o nome exato:

```
static/firmware/esp32-micropython.bin
```

Hoje é o `ESP32_GENERIC-20260824-v1.29.0.bin` (micropython.org, ESP32
clássico). Pra atualizar, basta substituir o arquivo mantendo o nome.

É ele que o editor grava sozinho quando a placa responde no Upload sem ter
MicroPython instalado — placa nova, ou placa que acabou de receber um sketch
C++ pelo modo texto (esse sobrescreve a flash inteira). Ver
`src/lib/board-upload/micropython-firmware.js`.

Detalhes que importam:

- **Offset de gravação: `0x1000`** (constante `FIRMWARE_FLASH_ADDRESS`). É o
  offset dos binários de release do ESP32 clássico em micropython.org. Se um
  dia a placa virar ESP32-S3/C3, o offset passa a ser `0x0` — é preciso mudar
  a constante.
- O arquivo é baixado por `fetch` em tempo de execução, não entra no bundle:
  trocar o `.bin` não exige rebuild, só substituir o arquivo.
- Para servir o firmware de outro lugar (CDN, por exemplo), defina
  `MICROPYTHON_FIRMWARE_URL` no build.
- Arquivos menores que 256 KB são recusados: é o sinal de que o servidor
  devolveu um HTML de "não encontrado" em vez do binário.
