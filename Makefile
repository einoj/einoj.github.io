srcdir = src
builddir = build
index.md = $(srcdir)/index.md
top.css = $(srcdir)/top.css
subdirs = $(wildcard $(srcdir)/*/)
builddirs = $(patsubst $(srcdir)/%,$(builddir)/%,$(subdirs))
sources  = $(filter-out %README.md, $(wildcard $(addsuffix *.md, $(subdirs))))
html = $(patsubst $(srcdir)%.md,$(builddir)%.html, $(sources))
imgdirs = $(wildcard $(srcdir)/*/img)
imgobjs = $(patsubst $(srcdir)%,$(builddir)%,$(imgdirs))
tacolatorsrc = $(filter-out %.md, $(wildcard $(srcdir)/tacolator/*.*))
tacolatorobjs = $(patsubst $(srcdir)%,$(builddir)%,$(tacolatorsrc))
index.html = $(patsubst $(srcdir)%.md,$(builddir)%.html,$(index.md))

all: $(builddirs) $(index.html) $(subdirs) $(html) $(imgobjs) $(tacolatorobjs) $(builddir)/CNAME

$(index.html): $(index.md) $(top.css)
	pandoc  -f markdown -t html $< -o $@ --self-contained --css=$(top.css)

$(builddir)/CNAME: $(srcdir)/CNAME
	cp $(subst $(builddir),$(srcdir),$@)  $@

$(builddir)/top.css: $(srcdir)/top.css
	cp $(subst $(builddir),$(srcdir),$@)  $@

$(html): $(sources) $(builddir)/top.css
	pandoc $(subst html,md,$(subst $(builddir),$(srcdir),$@)) -f markdown -t html -s -o $@ --css=../top.css

$(imgobjs): $(imgdirs)
	cp -r $(subst $(builddir),$(srcdir),$@) $@

$(tacolatorobjs): $(tacolatorsrc)
	cp $(subst $(builddir),$(srcdir),$@) $@

$(builddirs):
	mkdir -p $@

clean:
	rm -rf build
