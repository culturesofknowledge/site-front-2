import emlo from "/static/js/edges.js";

emlo.ResultTable = class extends edges.Component {
  constructor(params) {
    super(params);

    // the secondary results to get the data from, if not using the primary
    this.secondaryResults = edges.util.getParam(
      params,
      "secondaryResults",
      false
    );

    // filter function that can be used to trim down the result set
    this.filter = edges.util.getParam(params, "filter", false);

    // a sort function that can be used to organise the results
    this.sort = edges.util.getParam(params, "sort", false);

    // the maximum number of results to be stored
    this.limit = edges.util.getParam(params, "limit", false);

    this.infiniteScroll = edges.util.getParam(params, "infiniteScroll", false);

    this.infiniteScrollPageSize = edges.util.getParam(
      params,
      "infiniteScrollPageSize",
      10
    );

    this.updateHeader = edges.util.getParam(params, "updateHeader", false);
    this.headerSelector = edges.util.getParam(
      params,
      "headerSelector",
      "header"
    );

    //////////////////////////////////////
    // variables for tracking internal state

    // the results retrieved from ES.  If this is "false" this means that no synchronise
    // has been called on this object, which in turn means that initial searching is still
    // going on.  Once initialised this will be a list (which may in turn be empty, meaning
    // that no results were found)
    this.results = false;

    this.infiniteScrollQuery = false;

    this.hitCount = 0;
    this.highlighting = {};
  }

  synchronise() {
    // reset the state of the internal variables
    this.results = [];
    this.infiniteScrollQuery = false;
    this.hitCount = 0;

    var source = this.edge.result;
    if (this.secondaryResults !== false) {
      source = this.edge.secondaryResults[this.secondaryResults];
    }

    // if there are no sources to pull results from, leave us with an empty
    // result set
    if (!source) {
      return;
    }

    if (source && source.data && source.data.hasOwnProperty("highlighting")) {
      this.highlighting = source.data["highlighting"];
    }

    // first filter the results
    var results = source.results();
    this._appendResults({ results: results });

    // record the hit count for later use
    this.hitCount = source.total();

    if (this.updateHeader) {
      this._updateHeader();
    }

    // --- REMOVE MODAL AFTER OPERATION ---
    setTimeout(() => {
      let doc = document.getElementById("remove-message");
      if (doc) {
        doc.style.display = "none";
      }
    }, 500); // remove after 0.5s for a smooth UX
  }

  _updateHeader() {
    let currentDoc = document.getElementById(this.headerSelector);
    try {
      if (!currentDoc) {
        return;
      }

      // Check if the fetching process is active
      if (this.results === false) {
        currentDoc.innerHTML = "Loading results...";
        return;
      }

      if (this.hitCount > 0) {
        let refineSearch = document.getElementById("refine_search");
        refineSearch.style.display = "inline";
      }

      // Check if results are fetched correctly
      if (this.hitCount && this.hitCount >= 0) {
        if (this.hitCount > 50) {
          currentDoc.innerHTML = `${this.hitCount} results (50 results per page)`;
        } else {
          currentDoc.innerHTML = `${this.hitCount} ${
            this.hitCount > 1 ? "results" : "result"
          }`;
        }
      } else {
        // Fallback message when results are not fetched
        currentDoc.innerHTML = "";
      }
    } catch (err) {
      console.error(err);
      currentDoc.innerHTML = "";
    }
  }

  _appendResults(params) {
    var results = params.results;

    if (this.filter) {
      results = this.filter({ results: results });
    }

    if (this.sort) {
      results.sort(this.sort);
    }

    if (this.limit !== false) {
      results = results.slice(0, this.limit);
    }

    this.results = this.results.concat(results);
  }

  infiniteScrollNextPage(params) {
    var callback = params.callback;

    // if we have exhausted the result set, don't try to get the next page
    if (this.results.length >= this.hitCount) {
      return;
    }

    if (!this.infiniteScrollQuery) {
      this.infiniteScrollQuery = this.edge.cloneQuery();
      this.infiniteScrollQuery.clearAggregations();
    }

    // move the from/size parameters to get us the next page
    var currentSize = this.infiniteScrollQuery.getSize();
    var currentFrom = this.infiniteScrollQuery.getFrom();
    if (currentFrom === false) {
      currentFrom = 0;
    }
    this.infiniteScrollQuery.from = currentFrom + currentSize;
    this.infiniteScrollQuery.size = this.infiniteScrollPageSize;

    var successCallback = edges.util.objClosure(
      this,
      "infiniteScrollSuccess",
      ["result"],
      { callback: callback }
    );
    var errorCallback = edges.util.objClosure(
      this,
      "infiniteScrollError",
      false,
      { callback: callback }
    );

    this.edge.queryAdapter.doQuery({
      edge: this.edge,
      query: this.infiniteScrollQuery,
      success: successCallback,
      error: errorCallback,
    });
  }

  infiniteScrollSuccess(params) {
    var results = params.result.results();
    this._appendResults({ results: results });
    params.callback();
  }

  infiniteScrollError(params) {
    alert("error");
    params.callback();
  }
};
