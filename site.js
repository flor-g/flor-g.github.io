(function () {
  const hasValidDocId = (id) => {
    if (!id && id !== 0) {
      return false;
    }

    return !String(id).startsWith('REPLACE_WITH');
  };

  // Only Markdown files hosted on this site, e.g. "thesis/draft1.md".
  const isLocalMarkdownPath = (path) =>
    typeof path === 'string' && /^[\w-]+(\/[\w.-]+)*\.md$/.test(path) && !path.includes('..');

  // Discourage copying text from the site. This is not real protection: the
  // files are public, and embedded Google Docs (other origins) are unaffected.
  const disableCopying = () => {
    ['copy', 'cut', 'dragstart', 'selectstart'].forEach((type) => {
      document.addEventListener(type, (event) => event.preventDefault());
    });
  };

  disableCopying();

  // `modified` is an ISO date ("2026-10-01"). Newest first; undated entries keep
  // their original order after the dated ones.
  const sortByModified = (documents) =>
    documents
      .map((doc, index) => ({ doc, index }))
      .sort((a, b) => {
        const da = a.doc.modified || '';
        const db = b.doc.modified || '';
        if (da !== db) {
          if (!da) return 1;
          if (!db) return -1;
          return da < db ? 1 : -1;
        }
        return a.index - b.index;
      })
      .map(({ doc }) => doc);

  // "2026-11-09" -> "11/09/2026"; undated documents show blanks.
  const formatShortDate = (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return match ? `${match[2]}/${match[3]}/${match[1]}` : '--/--/----';
  };

  const googleWorkspacePreviewPaths = {
    gdoc: 'document',
    gsheet: 'spreadsheets',
    gslide: 'presentation',
  };

  const googleWorkspaceMimePreviewPaths = {
    'application/vnd.google-apps.document': 'document',
    'application/vnd.google-apps.spreadsheet': 'spreadsheets',
    'application/vnd.google-apps.presentation': 'presentation',
  };

  const getDocumentEmbedSrc = (doc) => {
    if (!doc || !hasValidDocId(doc.id)) {
      return null;
    }

    if (doc.embedUrl) {
      return doc.embedUrl;
    }

    const typeKey = typeof doc.type === 'string' ? doc.type.toLowerCase() : '';

    if (typeKey === 'markdown') {
      return isLocalMarkdownPath(doc.src) ? `reader.html?src=${encodeURIComponent(doc.src)}` : null;
    }

    // A PDF hosted on this site, shown in the browser's own PDF viewer.
    if (typeKey === 'pdf') {
      return typeof doc.src === 'string' && /^[\w-]+(\/[\w.-]+)*\.pdf$/.test(doc.src) ? `${doc.src}#navpanes=0` : null;
    }
    const workspacePath = googleWorkspacePreviewPaths[typeKey];

    if (workspacePath) {
      return `https://docs.google.com/${workspacePath}/d/${encodeURIComponent(doc.id)}/preview`;
    }

    const mimePath = doc.mimeType ? googleWorkspaceMimePreviewPaths[doc.mimeType] : undefined;
    if (mimePath) {
      return `https://docs.google.com/${mimePath}/d/${encodeURIComponent(doc.id)}/preview`;
    }

    const documentUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(doc.id)}`;
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(documentUrl)}`;
  };

  // Marks a link that leaves the site.
  const createExternalMark = () => {
    const mark = document.createElement('span');
    mark.className = 'leaf-ext';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '↗';
    return mark;
  };

  const initHomePage = () => {
    const normalizeDocuments = (value) =>
      Array.isArray(value) ? sortByModified(value.filter((doc) => doc && doc.title)) : [];

    const populateSlots = (slotsElement, documents, options = {}) => {
      const { targetPage = null } = options;

      if (!slotsElement || !documents.length) {
        return;
      }

      const fragment = document.createDocumentFragment();

      documents.forEach((doc) => {
        let href = null;

        if (doc && typeof doc.url === 'string' && doc.url.trim()) {
          href = doc.url.trim();
        } else if (targetPage) {
          href = targetPage;
          if (hasValidDocId(doc.id)) {
            href = `${targetPage}?doc=${encodeURIComponent(doc.id)}`;
          }
        }

        if (!href) {
          return;
        }

        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'leaf';

        const branch = document.createElement('span');
        branch.className = 'branch';
        branch.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.className = 'leaf-label';
        label.textContent = doc.shortTitle || doc.title;

        link.href = href;
        if (doc.shortTitle) {
          link.title = doc.title;
        } else if (doc.description) {
          link.title = doc.description;
        }

        if (targetPage && href.startsWith(`${targetPage}?`) && hasValidDocId(doc.id)) {
          link.setAttribute('data-doc-id', doc.id);
        }

        if (doc.url && /^https?:/i.test(doc.url)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          label.append(' ', createExternalMark());
        }

        link.append(branch, label);
        item.appendChild(link);
        fragment.appendChild(item);
      });

      slotsElement.replaceChildren(fragment);
    };

    populateSlots(
      document.getElementById('papers-slots'),
      normalizeDocuments(window.papersDocuments),
      { targetPage: 'papers.html' }
    );

    populateSlots(
      document.getElementById('writings-slots'),
      normalizeDocuments(window.casualWritingDocuments),
      { targetPage: 'writings.html' }
    );

    populateSlots(
      document.getElementById('projects-slots'),
      normalizeDocuments(window.projectItems)
    );

    document.querySelectorAll('.toggle-slots').forEach((button) => {
      const controlsId = button.getAttribute('aria-controls');
      const slots = controlsId
        ? document.getElementById(controlsId)
        : button.closest('section')?.querySelector('.slots');

      if (!slots) {
        return;
      }

      // The button's own text names the section; aria-expanded carries the state.
      const syncButtonState = (expanded) => {
        button.setAttribute('aria-expanded', String(expanded));
        slots.hidden = !expanded;
      };

      const initialExpanded = button.getAttribute('aria-expanded');
      syncButtonState(initialExpanded === 'false' ? false : true);

      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        syncButtonState(!expanded);
      });
    });
  };

  const buildFolderItem = (doc) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'folder-item';
    if (doc.shortTitle) {
      button.title = doc.title;
    }
    if (doc.id !== undefined) {
      button.dataset.docId = doc.id;
    }
    button.setAttribute('aria-current', 'false');

    const branch = document.createElement('span');
    branch.className = 'branch';
    branch.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'folder-label';
    label.textContent = doc.shortTitle || doc.title;

    button.append(branch, label);
    item.appendChild(button);
    return { item, button };
  };

  // Opens or closes a list from its caret button.
  const setExpanded = (button, list, expanded) => {
    button.setAttribute('aria-expanded', String(expanded));
    list.hidden = !expanded;
  };

  const initDocumentPage = ({ documents, viewerId, listId, urlParam = 'doc' }) => {
    const filteredDocuments = Array.isArray(documents)
      ? sortByModified(documents.filter((doc) => doc && doc.title && doc.id))
      : [];

    const list = document.getElementById(listId);
    let viewer = document.getElementById(viewerId);
    const modifiedLabel = document.getElementById('document-modified');
    const folder = list?.closest('.folder');
    const folderToggle = folder?.querySelector('.folder-toggle');
    const contents = document.getElementById('document-contents');
    const contentsList = document.getElementById('contents-list');
    const contentsToggle = contents?.querySelector('.contents-toggle');

    if (!list || !viewer) {
      return;
    }

    const documentLookup = new Map(filteredDocuments.map((doc) => [doc.id, doc]));
    let buttons = [];
    let activeDoc = null;

    // On narrow screens the folder list folds away under "../Name >".
    const setFolderOpen = (open) => {
      if (!folder) {
        return;
      }
      folder.dataset.open = String(open);
      folderToggle?.setAttribute('aria-expanded', String(open));
    };

    folderToggle?.addEventListener('click', () => {
      setFolderOpen(folder.dataset.open !== 'true');
    });

    const showModified = (doc) => {
      if (modifiedLabel) {
        modifiedLabel.textContent = `#Last updated: ${formatShortDate(doc?.modified)}`;
      }
    };

    const clearContents = () => {
      if (!contents || !contentsList) {
        return;
      }
      contents.hidden = true;
      contentsList.replaceChildren();
      if (contentsToggle) {
        setExpanded(contentsToggle, contentsList, false);
      }
    };

    const scrollViewerTo = (id) => {
      viewer.contentWindow?.postMessage({ type: 'reader-scroll', id }, window.location.origin);
    };

    const buildContentsEntry = (heading) => {
      const item = document.createElement('li');
      const row = document.createElement('div');
      row.className = 'toc-row';

      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'toc-link';
      const branch = document.createElement('span');
      branch.className = 'branch';
      branch.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'toc-label';
      label.textContent = heading.text;
      link.append(branch, label);
      link.addEventListener('click', () => scrollViewerTo(heading.id));

      row.appendChild(link);
      item.appendChild(row);
      return { item, row };
    };

    // Two levels: the document's top sections, each folding open to its subsections.
    const renderContents = (headings) => {
      clearContents();
      if (!contents || !contentsList) {
        return;
      }

      const entries = Array.isArray(headings)
        ? headings.filter(
            (h) => h && typeof h.id === 'string' && typeof h.text === 'string' && h.text && Number.isInteger(h.level)
          )
        : [];
      if (!entries.length) {
        return;
      }

      const base = Math.min(...entries.map((h) => h.level));
      const sections = [];
      entries.forEach((heading) => {
        if (heading.level === base) {
          sections.push({ heading, subsections: [] });
        } else if (heading.level === base + 1 && sections.length) {
          sections[sections.length - 1].subsections.push(heading);
        }
      });

      const fragment = document.createDocumentFragment();
      sections.forEach(({ heading, subsections }) => {
        const { item, row } = buildContentsEntry(heading);

        if (subsections.length) {
          const sub = document.createElement('ul');
          sub.className = 'toc-sub';
          sub.hidden = true;
          subsections.forEach((subheading) => sub.appendChild(buildContentsEntry(subheading).item));

          const caret = document.createElement('button');
          caret.type = 'button';
          caret.className = 'toc-caret';
          caret.setAttribute('aria-label', `Subsections of ${heading.text}`);
          caret.setAttribute('aria-expanded', 'false');
          const caretMark = document.createElement('span');
          caretMark.className = 'caret';
          caretMark.setAttribute('aria-hidden', 'true');
          caret.appendChild(caretMark);
          caret.addEventListener('click', () => {
            setExpanded(caret, sub, caret.getAttribute('aria-expanded') !== 'true');
          });

          row.appendChild(caret);
          item.appendChild(sub);
        }

        fragment.appendChild(item);
      });

      contentsList.replaceChildren(fragment);
      contents.hidden = false;
    };

    contentsToggle?.addEventListener('click', () => {
      setExpanded(contentsToggle, contentsList, contentsToggle.getAttribute('aria-expanded') !== 'true');
    });

    // reader.html reports its headings once a Markdown document has rendered.
    window.addEventListener('message', (event) => {
      if (
        event.source !== viewer.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.type !== 'reader-headings' ||
        !activeDoc ||
        event.data.src !== activeDoc.src
      ) {
        return;
      }
      renderContents(event.data.headings);
    });

    const updateUrl = (docId, hasEmbed) => {
      if (!window.history || typeof window.history.replaceState !== 'function') {
        return;
      }

      const url = new URL(window.location.href);
      if (hasEmbed && docId) {
        url.searchParams.set(urlParam, docId);
      } else {
        url.searchParams.delete(urlParam);
      }

      window.history.replaceState(null, '', url);
    };

    const setActiveDocument = (docId, { allowUrlUpdate = true } = {}) => {
      clearContents();

      const doc = documentLookup.get(docId);
      const embedSrc = doc ? getDocumentEmbedSrc(doc) : null;

      buttons.forEach((btn) => {
        const isMatch = btn.dataset.docId === docId && !!embedSrc;
        btn.setAttribute('aria-current', isMatch ? 'true' : 'false');
      });

      activeDoc = embedSrc ? doc : null;
      showModified(activeDoc);
      // A fresh frame per document. Changing src on a frame showing a Google
      // Doc does not always navigate it (the old doc stays, blank), and each
      // src change would also add an entry to the browser's back history.
      const frame = viewer.cloneNode(false);
      frame.src = embedSrc || 'about:blank';
      viewer.replaceWith(frame);
      viewer = frame;

      if (allowUrlUpdate) {
        updateUrl(embedSrc ? docId : null, !!embedSrc);
      }
      return !!embedSrc;
    };

    const entries = filteredDocuments.map(buildFolderItem);
    list.replaceChildren(...entries.map((entry) => entry.item));
    buttons = entries.map((entry) => entry.button);

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        setActiveDocument(button.dataset.docId);
        setFolderOpen(false);
      });
    });

    if (!buttons.length) {
      showModified(null);
      updateUrl(null, false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get(urlParam);
    let hasActiveDocument = false;

    if (requestedId && documentLookup.has(requestedId)) {
      hasActiveDocument = setActiveDocument(requestedId, { allowUrlUpdate: false });
    }

    if (!hasActiveDocument) {
      for (const button of buttons) {
        if (setActiveDocument(button.dataset.docId, { allowUrlUpdate: false })) {
          hasActiveDocument = true;
          break;
        }
      }
    }

    if (!hasActiveDocument) {
      updateUrl(null, false);
    }
  };

  const initGallery = ({
    galleryItems,
    viewerId,
    iframeId,
    captionId,
    emptyMessageId,
    prevButtonId,
    nextButtonId,
    descriptionId,
    descriptionPanelId,
    transcriptionId,
  }) => {
    const items = Array.isArray(galleryItems)
      ? galleryItems.filter((item) => item && item.title)
      : [];

    const galleryViewer = document.getElementById(viewerId);
    const galleryIframe = document.getElementById(iframeId);
    const galleryCaptionEl = document.getElementById(captionId);
    const galleryEmptyMessage = document.getElementById(emptyMessageId);
    const galleryPrevButton = document.getElementById(prevButtonId);
    const galleryNextButton = document.getElementById(nextButtonId);
    const galleryDescriptionEl = descriptionId
      ? document.getElementById(descriptionId)
      : null;
    const galleryDescriptionPanel = descriptionPanelId
      ? document.getElementById(descriptionPanelId)
      : galleryDescriptionEl?.closest('.gallery-description-panel') ?? null;
    const galleryTranscriptionEl = transcriptionId
      ? document.getElementById(transcriptionId)
      : null;

    if (!galleryViewer || !galleryEmptyMessage) {
      return;
    }

    const defaultDescriptionMessage =
      galleryDescriptionEl?.textContent?.trim() ||
      'Select a gallery item to read its description.';
    const defaultTranscriptionMessage =
      galleryTranscriptionEl?.textContent?.trim() ||
      'Select a gallery item to read its transcription.';

    const setDescriptionMessage = (message) => {
      if (galleryDescriptionEl) {
        galleryDescriptionEl.textContent = message;
      }
    };

    const setTranscriptionMessage = (message) => {
      if (galleryTranscriptionEl) {
        galleryTranscriptionEl.textContent = message;
      }
    };

    const getGalleryEmbedSrc = (item) => {
      if (!item) {
        return null;
      }

      if (item.embedUrl) {
        return item.embedUrl;
      }

      if (hasValidDocId(item.id)) {
        return `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/preview`;
      }

      return null;
    };

    let activeGalleryIndex = 0;

    const syncGalleryControls = () => {
      if (!galleryPrevButton || !galleryNextButton) {
        return;
      }

      const multiple = items.length > 1;
      galleryPrevButton.disabled = !multiple;
      galleryNextButton.disabled = !multiple;
    };

    const setActiveGalleryItem = (index = 0) => {
      if (!items.length) {
        return;
      }

      activeGalleryIndex = (index + items.length) % items.length;
      const item = items[activeGalleryIndex];
      const embedSrc = getGalleryEmbedSrc(item);

      if (galleryDescriptionPanel) {
        galleryDescriptionPanel.hidden = false;
      }
      if (galleryTranscriptionEl) {
        const transcriptionText = item?.transcription?.trim();
        const transcriptionMessage = transcriptionText
          ? item.transcription
          : 'No transcription available for this piece yet.';
        setTranscriptionMessage(transcriptionMessage);
      }

      if (galleryDescriptionEl) {
        const descriptionText = item?.description
          ? item.description
          : 'No description available for this piece yet.';
        setDescriptionMessage(descriptionText);
      }

      if (galleryCaptionEl) {
        const captionText = item && item.title ? item.title : '';
        galleryCaptionEl.textContent = captionText;
        galleryCaptionEl.hidden = !captionText;
      }

      if (galleryIframe) {
        if (embedSrc) {
          galleryIframe.src = embedSrc;
          galleryIframe.hidden = false;
        } else {
          galleryIframe.src = 'about:blank';
          galleryIframe.hidden = true;
        }
      }
    };

    const renderGallery = () => {
      if (!items.length) {
        galleryViewer.hidden = true;
        galleryEmptyMessage.hidden = false;
        if (galleryCaptionEl) {
          galleryCaptionEl.hidden = true;
          galleryCaptionEl.textContent = '';
        }
        if (galleryDescriptionPanel) {
          galleryDescriptionPanel.hidden = true;
        }
        setDescriptionMessage(defaultDescriptionMessage);
        setTranscriptionMessage(defaultTranscriptionMessage);
        return;
      }

      galleryViewer.hidden = false;
      galleryEmptyMessage.hidden = true;
      if (galleryDescriptionPanel) {
        galleryDescriptionPanel.hidden = false;
      }
      syncGalleryControls();
      setActiveGalleryItem(activeGalleryIndex);
    };

    if (galleryPrevButton) {
      galleryPrevButton.addEventListener('click', () => {
        setActiveGalleryItem(activeGalleryIndex - 1);
      });
    }

    if (galleryNextButton) {
      galleryNextButton.addEventListener('click', () => {
        setActiveGalleryItem(activeGalleryIndex + 1);
      });
    }

    renderGallery();
  };

  const initReaderPage = async () => {
    const content = document.getElementById('reader-content');
    const tocNav = document.getElementById('reader-toc');
    const tocList = document.getElementById('reader-toc-list');

    if (!content || typeof window.renderMarkdown !== 'function') {
      return;
    }

    const showStatus = (message) => {
      const status = document.createElement('p');
      status.className = 'reader-status';
      status.textContent = message;
      content.replaceChildren(status);
    };

    const src = new URLSearchParams(window.location.search).get('src');
    if (!isLocalMarkdownPath(src)) {
      showStatus('No document selected.');
      return;
    }

    let markdown;
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      markdown = await response.text();
    } catch (error) {
      showStatus('This document could not be loaded.');
      return;
    }

    const renderMath = (tex, displayMode) => {
      if (!window.katex) {
        const code = document.createElement('code');
        code.textContent = tex;
        return code.outerHTML;
      }
      return window.katex.renderToString(tex, { displayMode, throwOnError: false });
    };

    const { html, headings } = window.renderMarkdown(markdown, { renderMath });
    content.innerHTML = html;

    const title = content.querySelector('h1');
    if (title) {
      document.title = title.textContent;
    }

    // Inside a Papers/Thoughts page, the page draws the Contents tree beside
    // this frame, so hand it the headings (title excluded) instead.
    const embedded = window.parent !== window;
    if (embedded) {
      const headingText = (id) => {
        const element = document.getElementById(id);
        if (!element) {
          return '';
        }
        const copy = element.cloneNode(true);
        copy.querySelectorAll('.katex-mathml, .md-fn-ref').forEach((node) => node.remove());
        return copy.textContent.replace(/\s+/g, ' ').trim();
      };

      window.parent.postMessage(
        {
          type: 'reader-headings',
          src,
          headings: headings.slice(1).map((heading) => ({
            level: heading.level,
            id: heading.id,
            text: headingText(heading.id),
          })),
        },
        window.location.origin
      );

      window.addEventListener('message', (event) => {
        if (
          event.source !== window.parent ||
          event.origin !== window.location.origin ||
          event.data?.type !== 'reader-scroll' ||
          typeof event.data.id !== 'string'
        ) {
          return;
        }
        document.getElementById(event.data.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Contents: top-level and second-level headings, skipping the title itself.
    const tocEntries = headings.filter((heading, index) => index > 0 && heading.level <= 2);
    if (!embedded && tocNav && tocList && tocEntries.length) {
      tocList.innerHTML = tocEntries
        .map(
          (heading) =>
            `<li class="reader-toc-level-${heading.level}"><a href="#${heading.id}">${heading.html}</a></li>`
        )
        .join('');
      tocNav.hidden = false;
    }

    if (window.location.hash) {
      document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    if (!body) {
      return;
    }

    if (body.classList.contains('reader-page')) {
      initReaderPage();
      return;
    }

    if (body.classList.contains('home-page')) {
      initHomePage();

      initGallery({
        galleryItems: window.soundGalleryItems,
        viewerId: 'sound-gallery-viewer',
        iframeId: 'sound-gallery-iframe',
        captionId: 'sound-gallery-caption',
        emptyMessageId: 'sound-gallery-empty',
        prevButtonId: 'sound-gallery-prev',
        nextButtonId: 'sound-gallery-next',
      });

      return;
    }

    if (body.classList.contains('document-page')) {
      const { documentsKey, viewerId, listId } = body.dataset || {};
      const documentsSource = documentsKey ? window[documentsKey] : undefined;

      initDocumentPage({
        documents: Array.isArray(documentsSource) ? documentsSource : [],
        viewerId: viewerId || 'document-viewer',
        listId: listId || 'document-list',
      });
    }

    if (body.classList.contains('writings-page')) {
      initGallery({
        galleryItems: window.galleryItems,
        viewerId: 'gallery-viewer',
        iframeId: 'gallery-iframe',
        captionId: 'gallery-caption',
        emptyMessageId: 'gallery-empty-message',
        prevButtonId: 'gallery-prev',
        nextButtonId: 'gallery-next',
        descriptionId: 'gallery-description',
        descriptionPanelId: 'gallery-description-panel',
        transcriptionId: 'gallery-transcription',
      });
    }
  });
})();
