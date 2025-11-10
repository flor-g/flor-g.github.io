(function () {
  const hasValidDocId = (id) => {
    if (!id && id !== 0) {
      return false;
    }

    return !String(id).startsWith('REPLACE_WITH');
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

  const createArrowIcon = () => {
    const icon = document.createElement('span');
    icon.className = 'slot-link-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '↗';
    return icon;
  };

  const createGithubIcon = () => {
    const wrapper = document.createElement('span');
    wrapper.className = 'slot-link-icon slot-link-icon--github';
    wrapper.setAttribute('aria-hidden', 'true');

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute(
      'd',
      'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z'
    );

    svg.appendChild(path);
    wrapper.appendChild(svg);
    return wrapper;
  };

  const initHomePage = () => {
    const normalizeDocuments = (value) =>
      Array.isArray(value) ? value.filter((doc) => doc && doc.title) : [];

    const populateSlots = (slotsElement, documents, options = {}) => {
      const { targetPage = null, iconRenderer = null } = options;

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

        const link = document.createElement('a');
        link.className = 'slot slot-link';

        const label = document.createElement('span');
        label.className = 'slot-link-label';
        label.textContent = doc.title;

        link.href = href;

        if (targetPage && href.startsWith(`${targetPage}?`) && hasValidDocId(doc.id)) {
          link.setAttribute('data-doc-id', doc.id);
        }

        if (doc.url && /^https?:/i.test(doc.url)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }

        const icon =
          typeof iconRenderer === 'function' ? iconRenderer(doc) : createArrowIcon();

        link.append(label, icon);
        fragment.appendChild(link);
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
      normalizeDocuments(window.projectItems),
      {
        targetPage: null,
        iconRenderer: (doc) =>
          doc?.url && /github\.com/i.test(doc.url) ? createGithubIcon() : createArrowIcon(),
      }
    );

    document.querySelectorAll('.toggle-slots').forEach((button) => {
      const controlsId = button.getAttribute('aria-controls');
      const slots = controlsId
        ? document.getElementById(controlsId)
        : button.closest('section')?.querySelector('.slots');

      if (!slots) {
        return;
      }

      const showLabel = button.dataset.showText || 'Show';
      const hideLabel = button.dataset.hideText || 'Hide';
      const textLabel = button.querySelector('.toggle-slots-text');

      const syncButtonState = (expanded) => {
        button.setAttribute('aria-expanded', String(expanded));
        slots.hidden = !expanded;
        if (textLabel) {
          textLabel.textContent = expanded ? hideLabel : showLabel;
        } else {
          button.setAttribute('aria-label', expanded ? hideLabel : showLabel);
        }
      };

      const initialExpanded = button.getAttribute('aria-expanded');
      syncButtonState(initialExpanded === 'false' ? false : true);

      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        syncButtonState(!expanded);
      });
    });
  };

  const buildDocumentButton = (doc) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'document-button';
    button.textContent = doc.title;
    if (doc.id !== undefined) {
      button.dataset.docId = doc.id;
    }
    button.setAttribute('aria-current', 'false');
    return button;
  };

  const initDocumentPage = ({
    documents,
    viewerId,
    sidebarListId,
    mobileListId,
    urlParam = 'doc',
  }) => {
    const filteredDocuments = Array.isArray(documents)
      ? documents.filter((doc) => doc && doc.title && doc.id)
      : [];

    const sidebarList = document.getElementById(sidebarListId);
    const mobileList = document.getElementById(mobileListId);
    const viewer = document.getElementById(viewerId);

    if (!sidebarList || !mobileList || !viewer) {
      return;
    }

    const documentLookup = new Map(filteredDocuments.map((doc) => [doc.id, doc]));
    let buttons = [];

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
      if (!buttons.length) {
        viewer.src = 'about:blank';
        if (allowUrlUpdate) {
          updateUrl(null, false);
        }
        return false;
      }

      const doc = documentLookup.get(docId);
      const embedSrc = doc ? getDocumentEmbedSrc(doc) : null;

      buttons.forEach((btn) => {
        const isMatch = btn.dataset.docId === docId && !!embedSrc;
        btn.setAttribute('aria-current', isMatch ? 'true' : 'false');
      });

      if (embedSrc) {
        viewer.src = embedSrc;
        if (allowUrlUpdate) {
          updateUrl(docId, true);
        }
        return true;
      }

      viewer.src = 'about:blank';
      if (allowUrlUpdate) {
        updateUrl(null, false);
      }
      return false;
    };

    const renderLists = () => {
      if (!filteredDocuments.length) {
        sidebarList.replaceChildren();
        mobileList.replaceChildren();
        buttons = [];
        viewer.src = 'about:blank';
        updateUrl(null, false);
        return;
      }

      const createListItem = (doc) => {
        const li = document.createElement('li');
        const button = buildDocumentButton(doc);
        li.appendChild(button);
        return { li, button };
      };

      const sidebarItems = filteredDocuments.map(createListItem);
      const mobileItems = filteredDocuments.map(createListItem);

      sidebarList.replaceChildren(...sidebarItems.map((item) => item.li));
      mobileList.replaceChildren(...mobileItems.map((item) => item.li));

      buttons = [
        ...sidebarItems.map((item) => item.button),
        ...mobileItems.map((item) => item.button),
      ];

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          setActiveDocument(button.dataset.docId);
        });
      });
    };

    const getRequestedDocId = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedId = params.get(urlParam);
      return requestedId && documentLookup.has(requestedId) ? requestedId : null;
    };

    renderLists();

    if (!buttons.length) {
      return;
    }

    let hasActiveDocument = false;
    const requestedId = getRequestedDocId();

    if (requestedId) {
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

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    if (!body) {
      return;
    }

    if (body.classList.contains('home-page')) {
      initHomePage();

      initGallery({
        galleryItems: window.soundGalleryItems,
        viewerId: 'sound-gallery-viewer',
        iframeId: 'sound-gallery-iframe',
        emptyMessageId: 'sound-gallery-empty',
        prevButtonId: 'sound-gallery-prev',
        nextButtonId: 'sound-gallery-next',
      });

      return;
    }

    if (body.classList.contains('document-page')) {
      const { documentsKey, viewerId, sidebarListId, mobileListId } = body.dataset || {};
      const documentsSource = documentsKey ? window[documentsKey] : undefined;

      initDocumentPage({
        documents: Array.isArray(documentsSource) ? documentsSource : [],
        viewerId: viewerId || 'document-viewer',
        sidebarListId: sidebarListId || 'sidebar-document-list',
        mobileListId: mobileListId || 'mobile-document-list',
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
