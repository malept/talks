Talks
=====

These are talks I've given that contain non-proprietary content (i.e., ones that didn't involve
NDA-level information).

Installation
------------

This repository uses `mise`_ to manage tool dependencies.

Assumes that Python (HTML creation) and Node.js (PDF creation) are
installed already.

.. code:: shell

   mise install

Development server
------------------

Runs a local HTTP server with a "hot reload" feature. By default it
runs on TCP port ``8888``.

.. code:: shell

   mise run dev [--port custom_port_number] <talk_dir>

Build (HTML)
------------

.. code:: shell

   mise run build:html <talk_dir> <output_dir>

See ``hovercraft --help`` for details on customization.

Build (PDF)
-----------

To generate a PDF, in one terminal, run the `development server`_.

In another terminal, run:

.. code:: shell

   mise run build:pdf [--port custom_port_number] <output_file>

If you wish to include presenter notes in the PDF and the presentation supports it, add the flag ``--include-presenter-notes``.

License
-------

Unless otherwise specified, the example code is copyrighted under the `Apache License 2.0`_, and the
content is copyrighted under the `Creative Commons Attribution Share-Alike 4.0 International`_
license.

.. _mise: https://mise.jdx.dev/
.. _Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0
.. _Creative Commons Attribution Share-Alike 4.0 International:
   https://creativecommons.org/licenses/by-sa/4.0/
