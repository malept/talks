Talks
=====

These are talks I've given that contain non-proprietary content (i.e., ones that didn't involve
NDA-level information).

Installation
------------

This repository uses `Poetry`_ to manage basic dependencies.

.. code:: shell

   poetry install

For PDF creation, this repository uses Node.js/yarn.

.. code:: shell

   yarn

Build
-----

.. code:: shell

   poetry run hovercraft $TALK_DIR/index.rst $OUTPUT_DIR

See ``poetry run hovercraft --help`` for details.

PDF
---

To generate a PDF, in one terminal, run:

.. code:: shell

   poetry run hovercraft --port 8888 $TALK_DIR/index.rst

In another terminal, run:

.. code:: shell

   yarn decktape impress http://localhost:8888/ path/to/generated.pdf

License
-------

Unless otherwise specified, the example code is copyrighted under the `Apache License 2.0`_, and the
content is copyrighted under the `Creative Commons Attribution Share-Alike 4.0 International`_
license.

.. _Poetry: https://python-poetry.org/
.. _Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0
.. _Creative Commons Attribution Share-Alike 4.0 International:
   https://creativecommons.org/licenses/by-sa/4.0/
