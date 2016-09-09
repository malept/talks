:skip-help: true
:css: hovercraft.css

.. role:: raw-html(raw)
   :format: html

.. title: Writing Rust for Fun (& Profit?), Part 3

----

:id: title-card

Writing Rust for Fun (& Profit?)
================================

Episode III: Revenge of the ASCII
---------------------------------

.. image:: images/rustacean-orig-trans.png
   :alt: [Rustacean]
   :width: 50%
   :class: rustacean
   :target: http://www.rustacean.net/

Presenter: Mark Lee - Pythonista, Rustacean, and Professional Rubyist

September 9, 2016

.. note::

    Welcome to part three in my continuing series on Rust. This time I'm going to talk about a gem I
    wrote to help people write Rust extensions for Ruby faster, and a real-life case study I did
    with Rust on one of our apps.

----

:id: thermite

Thermite
~~~~~~~~

:raw-html:`<iframe src="https://i.imgur.com/NzXAzNK.gifv" width="800" height="500"></iframe>`

(`Reddit source <https://redd.it/3aiu78>`_, `YouTube source <https://youtu.be/tj7S_DNFgEU?t=3m52s>`_)

.. note::

    I named the gem "thermite". One of the reasons may have been an excuse to watch a bunch of
    chemical reaction videos.

----

:id: why-thermite

Why name it Thermite?
~~~~~~~~~~~~~~~~~~~~~

.. |Al2O3| replace:: Al₂O₃
.. |Fe2O3| replace:: Fe₂O₃

* Ruby includes aluminum oxide (|Al2O3|)
* Rust: iron oxide (|Fe2O3|)
* A common thermite formula: |Fe2O3| + 2Al → 2Fe + |Al2O3|

.. note::

    But really, why name it Thermite? Unsurprisingly, a cheap shot at humor. According to Wikipedia,
    Ruby (the gemstone) contains aluminum oxide. Rust (the orange stuff) is iron oxide. A common
    thermite reaction uses iron oxide and aluminum to produce iron and aluminum oxide. Also, somehow
    the gem name "thermite" wasn't taken.

----

:id: what-is-thermite

Ha, ha. What does it do?
~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: images/ruby-logo.png
   :alt: Ruby

.. image:: images/rust-logo-512x512.png
   :alt: Rust
   :width: 256
   :height: 256

.. pull-quote::
    `Thermite <https://github.com/malept/thermite>`_ is a Rake-based helper for building and
    distributing Rust-based Ruby extensions.

.. note::

    Now that I've thoroughly explained the joke and made is painfully unfunny, I might as well
    describe what it does. The easiest way to do that is to quote the README.

----

:id: thermite-features

Thermite: Features
~~~~~~~~~~~~~~~~~~

----

:id: six-easy-steps

Use Thermite in Six Easy Steps!
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

0. Add ``thermite`` to your ``Gemfile``, run ``bundle``
1. Add to your gemspec:

   .. code:: ruby

       s.extensions << 'ext/Rakefile'
       s.add_runtime_dependency 'thermite', '~> 0'

2. Create ``ext/Rakefile``:

   .. code:: ruby

       require 'thermite/tasks'
       Thermite::Tasks.new

3. Load your extension via FFI + Thermite
4. ?
5. :raw-html:`<del>Profit!</del>` Performance!

.. note::

    I've tried to make it relatively simple to use. Add a gem, create a few files, some magic
    happens, and you're ready to write some fast code! I modeled how Thermite is invoked in the
    Rakefile from other gems which have Rake tasks, like Bundler and Rubocop. The gem itself has
    unit tests, API docs, and hopefully a fairly comprehensive README.

----

:id: case-study

Case Study: Transliteration
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. note::

    Switching gears slightly, I'm going to talk about a gem that I wrote this week to showcase how
    simple writing a Rust extension can be, even more so now that Thermite has been written.

----

:id: defining-transliteration

UTF-8 → ASCII
~~~~~~~~~~~~~

* é → e
* — → -
* ® → (R)

.. note::

    I should define what I mean by transliteration. In this case, it's the process taking characters
    outside of the ASCII character set and converting them into their ASCII "equivalent". For
    example, European characters with accents lose the accents, and traditional Chinese characters
    get converted to their pinyin equivalents. In our case, it's usually accented characters and
    punctuation that needs to get converted.

----

:id: i18n-gem


``i18n``
~~~~~~~~

* Dependency of ActiveSupport
* Pure Ruby
* ``I18n.transliterate(input_string)``

.. note::

    How does Rails help us with that? In ActiveSupport, the ``i18n`` gem is included and
    preconfigured so that we can transliterate strings with accented characters with a simple method
    call.

----

:id: i18n-profile


``i18n`` Profile
~~~~~~~~~~~~~~~~

.. note::

    I've been helping Dan with some optimizations lately. The low-hanging fruit was replacing
    ``gsub!`` calls with ``tr!`` calls when possible, which saved a bunch of memory allocations and
    presumably some CPU time. When I was looking at the memory profiler output, I noticed that the
    ``i18n`` gem allocated and retained more memory than I was expecting, so I dug into it. It turns
    out that the version of ``transliterate`` that we use runs ``gsub`` (no exclamation point) and
    goes character-by-character to see which ones need to be replaced. This allocates one object per
    character, which can get bad when you're running this on lots of large records.

----

:id: t12r

Enter: T12r
~~~~~~~~~~~

* Transliterator → T12r
* Rust: 45 LoC (not including tests)
* Ruby: 27 LoC (not including tests)
* ``T12r.transliterate(input_string, custom_translations)``

.. note::

    Since the bottleneck wasn't in our code, I decided to try an experiment: rewrite transliterate
    in Rust, monkeypatch the ``i18n`` gem, and see what kind of speedup I get. Luckily for me,
    someone wrote a Rust crate to transliterate Unicode, so I didn't have to reinvent the wheel. The
    only thing I had to write apart from the minimal glue code was support for "custom
    translations", which was pretty trivial - convert a Ruby hash into a Rust hash. All in all, it
    did not end up being that much code, less than 100 lines total.

----

:id: t12r-profile

``t12r`` Profile
~~~~~~~~~~~~~~~~

.. note::

    Turns out when I monkeypatch the ``i18n`` gem, the memory it allocates is cut in half.

----

:id: t12r-benchmarks

Benchmarks
~~~~~~~~~~

AWS EC2 t2.medium,
Ubuntu Linux 16.04 (amd64),
Ruby 2.3.1,
Rust 1.11.0

========================= ======== ======== ======== ======== ========
Benchmark                 Run 1    Run 2    Run 3    Run 4    Run 5
========================= ======== ======== ======== ======== ========
activesupport_unrealistic 9.229482 9.244237 9.207310 9.214158 9.303218
t12r_unrealistic          0.737353 0.736112 0.734379 0.737035 0.734893
activesupport_realistic   0.640747 0.632533 0.634910 0.636180 0.638756
t12r_realistic            0.315267 0.317564 0.315769 0.319236 0.316022
========================= ======== ======== ======== ======== ========

* Unrealistic benchmark (~13x speedup‽): 220 characters, 70% non-ASCII
* Realistic benchmark (~2x speedup):

  .. epigraph::
     Introducing: Slurm® Latté—Even more highly addictive!

.. note::

    Unfortunately running the memory profile script makes it more difficult to figure out if there
    are any speedups, so I wrote a quick benchmark script. It actually does two benchmarks - one
    with mostly special characters, and one with mostly normal characters. The special character
    benchmark was surprising, it was consistently around a 13x speedup. On the other hand, the
    benchmark with the more realistic text was closer to a 2x speedup. Not bad for less than 100
    lines of code.

----

:id: questions

Questions?
~~~~~~~~~~

.. image:: images/rust-logo-512x512.png
   :alt: [Rust Logo]
