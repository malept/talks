:skip-help: true
:css: hovercraft.css
:js-body: plugins/print-notes.js

.. title:: An Introduction to Stencil

----

An Introduction to Stencil
==========================

.. image:: images/stencil-logo.png
   :alt: Stencil
   :width: 50%
   :target: https://engineering.outreach.io/stencil/

Presenter: Mark Lee

August 2025

----

What is Stencil?
----------------

    A modern living-template engine for evolving repositories.

.. note::

   The upstream version of Stencil describes itself as "a modern living-template engine for
   evolving repositories". I generally refer to it as an advanced project template generator.

----

Prior Art
---------

* `Cookiecutter`_
* `GitHub template repositories`_

.. _Cookiecutter: https://cookiecutter.readthedocs.io/en/stable/
.. _GitHub template repositories: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository

.. note::

   Some examples of similar, but less advanced tooling include the Cookiecutter CLI from the Python
   ecosystem, and GitHub's template repositories, where you can copy a repository with a click in
   the GitHub UI. The main difference between these tools and Stencil is that rendered files can be
   updated with successive Stencil runs, and "blocks" of custom code within the managed files are preserved.

----

History: Pre-Stencil
--------------------

Mid-2020: Bootstrap v1.0.0
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. note::

   I like to look at things from a historical context to help understand why things are the way they
   are. In this case, the predecessor to Stencil, which was called Bootstrap, was created in light
   of an org-wide initiative to decompose the Ruby on Rails monolith into Go microservices, and the
   need to have those microservices standardized so there is as little friction as possible for any
   given Outreach engineer to get started on any microservice.

----

History: Stencil v1.0
---------------------

August 2021
~~~~~~~~~~~

.. note::

   After months of using Bootstrap, it became clear that ironically, it needed to be split up into
   different repositories, specifically, groups of templates that needed to be owned by different
   teams, instead of having everything stored in one (mono)repo. This was a big enough change to
   necessitate a rewrite, and also a good opportunity to open source the work. As a result, Stencil
   was born. The first major version was released about a year after the first version of Bootstrap.

----

Ecosystem
---------

* CLI
* Repositories

  * Manifest (``service.yaml``)
  * Lockfile (``stencil.lock``)
* Modules

  * Native Modules

.. note::

   Let's take a look at the different components of the Stencil ecosystem. The most obvious
   component is the stencil CLI. This is the primary way that engineers interact with Stencil. The
   CLI operates on git repositories, which contain, at minimum, a service manifest currently named
   service.yaml, which are basically configuration options which define how Stencil operates on the
   repository. Once Stencil has been run at least once on the repository, a lockfile (named
   stencil.lock) is created detailing the modules, their versions, and the files that they
   respectively manage. Modules are groups of templates which are rendered by Stencil. Native
   modules provide custom logic that can't be expressed by the default template functions and
   filters. For example, in stencil-golang, there's a function to merge go.mod entries such that
   newer entries override older entries, even if the older entries are specified by the template.

----

Repository: Manifest
--------------------

``service.yaml``

.. code:: yaml

   name: myservice
   arguments:
     description: My new service
     reportingTeam: my-team
   modules:
     - name: github.com/getoutreach/stencil-golang

.. note::

   Here's a very short example of a service manifest. "arguments" are repository metadata of which
   the modules defined in the following section define in their own manifest file (example later).

----

Anatomy of a Module
-------------------

* Template manifest (``manifest.yaml``)
* Templates

  * Template blocks
* Module hooks
* Native module
* Snapshot tests (Go tests + snapshots)

.. note::

   A Stencil module consists of several components. We're going to go through most of them in this
   presentation, but they're explained in much more detail in the Stencil documentation.

----

Module: Manifest
----------------

``manifest.yaml``

.. code:: yaml

   name: stencil-module
   modules:
     - name: stencil-dependency
       version: "^1.0.0"
   stencilVersion: "^1.43.0"
   postRunCommand:
     - go mod tidy
     - gofmt
   arguments:
     reportingTeam:
       required: true
       description: The GitHub codeowner of the service (sans org).
       schema:
         type: string

.. note::

   The format of the template module manifest looks similar to the service manifest, but is
   functionally different. The "modules" section declares which other Stencil modules it depends on
   and the version constraints it requires. There's also a Stencil version constraint, in the event
   that certain features requires a certain Stencil version. "postRunCommand" is a list of commands
   that are run after all of the templates for this module have been rendered. Finally, "arguments"
   in this context actually define the arguments used by this module whose values are declared in
   the service manifest.

----

Module: Template
----------------

``app.go.tpl``
~~~~~~~~~~~~~~

.. code:: jinja

   import fmt

   func main() {
     fmt.Println("Hello, world")
     {{- if stencil.Arg "optional" }}
     fmt.Println("Optional print statement")
     {{- end }}
     // <<Stencil::Block(appCustom)>>
     {{ file.Block "appCustom" }}
     // <</Stencil::Block>
   }

``app.go``
~~~~~~~~~~

.. code:: go

   import fmt

   func main() {
     fmt.Println("Hello, world")

     // <<Stencil::Block(appCustom)>>
     fmt.Println("Custom print statement")
     // <</Stencil::Block>
   }

.. note::

   Here's an example of a small Go program as a Go template, and how it looks when rendered in
   a Stenciled repository. There's also an example of a template block. The print statement in
   the block will persist amongst Stencil runs.

----

Module: Hooks
-------------

``stencil-dependency``: ``require.go.tpl``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: jinja

   require (
     "github.com/getoutreach/goql"
     {{- range stencil.GetModuleHook "go-requires" }}
     {{ printf "%q" .name }}
     {{- end }}
   )


``stencil-module``: ``require.go.tpl``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: jinja

   {{- file.Skip "Defines module hooks for require.go.tpl" }}
   {{- define "goRequires" }}
   - github.com/getoutreach/stencil
   - github.com/getoutreach/vault-client
   {{- end }}
   {{ stencil.AddToModuleHook "github.com/getoutreach/stencil-dependency"
      "go-requires"
      (stencil.ApplyTemplate "goRequires" | fromYaml) }}

``require.go``
~~~~~~~~~~~~~~

.. code:: go

   require (
     "github.com/getoutreach/goql"
     "github.com/getoutreach/stencil"
     "github.com/getoutreach/vault-client"
   )

.. note::

   This is a very contrived example of how module hooks work. It's defined in a "parent" module, and
   the "child" adds a module hook to pass their context to it in order to render the actual file.
   The child template is considered a "virtual" file that is there only for defining the module
   hooks.

----

Module: Snapshot tests
----------------------

``main_test.go``

.. code:: go

   import (
     "testing"

     "github.com/getoutreach/stencil/pkg/stenciltest"
   )

   func TestAppGo(t *testing.T) {
     st := stenciltest.New(t, "app.go.tpl")
     st.Run(stenciltest.RegenerateSnapshots())
   }

   func TestAppGoOptional(t *testing.T) {
     st := stenciltest.New(t, "app.go.tpl")
     st.Args(map[string]any{"optional": true})
     st.Run(stenciltest.RegenerateSnapshots())
   }

.. note::

   Much like other snapshot tests (for example, Jest), there is a code part which declares what gets
   snapshotted, and the actual snapshot (not shown here) which is generated / updated via the Run
   method. In CI, Run checks the existing snapshot and fails if the existing snapshot does not
   match the generated snapshot.

----

Roadmap
-------

* Ecosystem testing
* Interactive Stenciled repository creation
* Work with upstream to find a good upgrade path
* Migrate to upstream

.. note::

   So the question becomes: what's next? One of the main initiatives for the team this year is to
   reduce the amount of scope that the team owns, given the amount of headcount allocated to it. Add
   to that the fact that the original author of Stencil has forked it and continued development,
   this is a good opportunity to migrate to the upstream version and discontinue maintaining our
   older copy of it. As it currently stands, there are some breaking (manual) changes between our
   version and the upstream version, which will need to get reconciled before we can
   start migrating. Of note is that the module testing framework was completely ripped out of the
   upstream version, and the upstream developers will be working with us on developing a more mature
   framework that handles all of the use cases that we've seen in our existing modules.
   We are also working on a tool to test changes to Stencil modules across the entire ecosystem, and
   a service to interactively create Stenciled repositories.

----

Sources
-------

* `Stencil documentation <https://engineering.outreach.io/stencil/>`_
* `Focus on Business Logic, not the Rest <https://web.archive.org/web/20250319031303/https://jaredallard.dev/focus-on-business-logic-not-the-rest/>`_
* `stencil v2 <https://web.archive.org/web/20250319034341/https://jaredallard.dev/stencil-v2/>`_

----

Questions❓
------------

.. image:: images/stencil-logo.png
   :alt: Stencil
   :width: 50%
   :target: https://stencil.rgst.io/
