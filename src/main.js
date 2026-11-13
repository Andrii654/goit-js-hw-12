import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(event) {
  event.preventDefault();

  const value = event.currentTarget.elements['search-text'].value.trim();
  if (!value) {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'topRight',
    });
    return;
  }

  query = value;
  page = 1;
  totalHits = 0;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    totalHits = data.totalHits;
    createGallery(data.hits);
    updateLoadMore();
  } catch (error) {
    showError(error);
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  hideLoadMoreButton();
  showLoader();
  page += 1;

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);
    scrollGallery();
    updateLoadMore();
  } catch (error) {
    page -= 1;
    showLoadMoreButton();
    showError(error);
  } finally {
    hideLoader();
  }
}

function updateLoadMore() {
  if (page >= Math.ceil(totalHits / PER_PAGE)) {
    hideLoadMoreButton();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
    });
  } else {
    showLoadMoreButton();
  }
}

function scrollGallery() {
  const card = document.querySelector('.gallery-item');
  if (!card) return;
  const { height } = card.getBoundingClientRect();
  window.scrollBy({ top: height * 2, behavior: 'smooth' });
}

function showError(error) {
  iziToast.error({
    message: `Something went wrong: ${error.message}`,
    position: 'topRight',
  });
}
