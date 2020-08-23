"use strict";
(function scopeWrapper($) {
    let dragSrcEl = null;
    let parentElementDragEnterAndLeave = null;
    let dragsterList = [];
    // Cache the current drag position
    let currentPosInd = null;

    // On DRAG START (The dragstart event is fired when the user starts dragging an element or text selection.)
    $('body').on('dragstart', '#futureTransactionsTable .recurTransEntry', function (e) {
        handleDragStart(e);
    });

    // On DRAG END (The dragend event is fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key)).
    $('body').on('dragend', '#futureTransactionsTable .recurTransEntry', function (e) {
        handleDragEnd(e);
    });

    // On DRAG ENTER (When the dragging has entered this div) (Triggers even for all child elements)
    $('body').on('dragenter', '#futureTransactionsTable .recurTransInfoTable', function (e) {

        // Don't do anything if dragged on the same wrapper.
        let closestParentWrapper = e.target.closest('.recurTransInfoTable');

        // Allow to be dropped only on different accounts
        if (dragSrcEl != closestParentWrapper) {
            e.preventDefault();
        }

        // Draw a line defining the position
        defineHrElement(e.target);

        // If parent element is the same then return
        if (parentElementDragEnterAndLeave == closestParentWrapper ||
            parentElementDragEnterAndLeave == e.target) {
            return false;
        }

        // Show all the transactions
        let recentTransactionEntry = closestParentWrapper.getElementsByClassName('recentTransactionEntry');
        if (recentTransactionEntry.length > 0) {
            for (let i = 0, l = recentTransactionEntry.length; i < l; i++) {
                let recTransEntry = recentTransactionEntry[i];
                recTransEntry.classList.remove('d-none');
                recTransEntry.classList.add('d-table-row');
            }
        }
        // Set the parent event as the account table
        parentElementDragEnterAndLeave = closestParentWrapper;
        return false;
    });

    // On DRAG OVER (The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds)) (Triggers even for all child elements)
    $('body').on('dragover', '#futureTransactionsTable .recurTransInfoTable', function (e) {
        // Allow to be dropped only on different accounts
        let closestParentWrapper = e.target.closest('.recurTransInfoTable');
        // Scroll the window
        scrollWindow(e);
        // Drag element comparison with closest parent
        if (dragSrcEl != closestParentWrapper) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'move';
            return false;
        }
    });

    // On DROP (The drop event is fired when an element or text selection is dropped on a valid drop target.)
    $('body').on('drop', '#futureTransactionsTable .recurTransInfoTable', function (e) {
        handleDrop(e);
    });

    // On DRAG LEAVE (only parent elements)
    document.addEventListener("dragster:leave", function (e) {

        // If parent element is not populated then return
        if (isEmpty(parentElementDragEnterAndLeave)) {
            return;
        }

        // set the parent element back to null
        parentElementDragEnterAndLeave = null;
    }, false);

    function defineHrElement(target) {
        let dropped = null;
        let positionOfDrag = document.getElementsByClassName('positionOfDrag');
        // If the element is already present then move the element
        if (positionOfDrag.length == 0) {
            dropped = populateHrElement();
        } else {
            dropped = positionOfDrag[0];
        }

        // Compare if the new position indicator is equal to the same position
        let nearestTrans = target.closest('.recentTransactionEntry');
        if (isNotEmpty(nearestTrans) && currentPosInd == nearestTrans) {
            return;
        }
        // Set the position indicator to the new position
        currentPosInd = nearestTrans
        insertAfterElement(dropped, target);
    }

    function populateHrElement() {
        let hrDiv = document.createElement('div');
        hrDiv.classList = 'positionOfDrag d-table-row';

        // Cell1
        let cell1 = document.createElement('div');
        cell1.classList = 'd-table-cell';
        hrDiv.appendChild(cell1);

        // Cell 2
        let cell2 = document.createElement('div');
        cell2.classList = 'd-table-cell';
        hrDiv.appendChild(cell2);

        // Cell 3
        let cell3 = document.createElement('div');
        cell3.classList = 'd-table-cell';
        hrDiv.appendChild(cell3);

        return hrDiv;
    }

    function handleDragStart(e) {
        // this / e.target is the source node.
        e.target.classList.add('op-50');
        // Set the drag start element
        dragSrcEl = e.target.closest('.recurTransInfoTable');
        // Set Drag effects
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        e.originalEvent.dataTransfer.dropEffect = 'move';
        e.originalEvent.dataTransfer.setData('text/plain', e.target.id);
        // Register dragster for Account Info Table
        let recurTransInfoTables = document.getElementsByClassName('recurTransInfoTable');
        for (let i = 0, l = recurTransInfoTables.length; i < l; i++) {
            dragsterList.push(new Dragster(recurTransInfoTables[i]));
            /*
             * Unhide the table elements
             */
            let recurInfoTable = recurTransInfoTables[i];
            // Rotate the arrow
            let arrowIndicator = recurInfoTable.firstElementChild.firstElementChild.firstElementChild;
            arrowIndicator.classList.toggle('rotateZero');
            arrowIndicator.classList.toggle('rotateNinty');
            let childElementWrappers = recurInfoTable.childNodes;
            for (let i = 1, len = childElementWrappers.length; i < len; i++) {
                let childElementWrapper = childElementWrappers[i];
                childElementWrapper.classList.toggle('d-none');
                childElementWrapper.classList.toggle('d-table-row');
            }
        }
    }

    function handleDragEnd(e) {
        // Do not scroll
        stopScroll = true;
        // this / e.target is the source node.
        e.target.classList.remove('op-50');
        // Remove all registered dragster
        for (let i = 0, l = dragsterList.length; i < l; i++) {
            // Remove Listeners
            dragsterList[i].removeListeners();
        }
        // Remove position indicator
        removePositionIndicator();
    }

    // Drop event is fired only on a valid target
    function handleDrop(e) {
        // this or e.target is current target element.
        e.preventDefault();

        if (e.stopPropagation) {
            // stops the browser from redirecting.
            e.stopPropagation();
        }

        // Don't do anything if dropped on the same wrapper div we're dragging.
        let closestParentWrapper = e.target.closest('.recurTransInfoTable');
        if (dragSrcEl != closestParentWrapper) {
            // Set the source column's HTML to the HTML of the column we dropped on.
            let recurTransId = e.originalEvent.dataTransfer.getData('text/plain');
            let a = document.getElementById(recurTransId);
            // Find the closest parent element and drop. (Should never be null)
            insertAfterElement(a, e.target);
            // Update the transaction with the new account ID
            updateTransactionWithRecurrence(recurTransId, closestParentWrapper.getAttribute('data-target'), dragSrcEl.getAttribute('data-target'));
        }

        return false;
    }

    // Remove the position indicator
    function removePositionIndicator() {
        // Remove all the separator
        let positionOfDrag = document.getElementsByClassName('positionOfDrag');

        while (positionOfDrag[0]) {
            // Remove all the element
            positionOfDrag[0].parentNode.removeChild(positionOfDrag[0]);
        }
    }

    // Insert element after the dropped target
    function insertAfterElement(dropped, target) {
        // fetch the closest transaction entry
        let insertAfter = target.closest('.recentTransactionEntry');

        if (isEmpty(insertAfter)) {
            // Fetch the closest heading
            insertAfter = target.closest('.recentTransactionDateGrp');
        }

        if (isNotEmpty(insertAfter)) {
            // Insert the element after the dropped element
            insertAfter.parentNode.insertBefore(dropped, insertAfter.nextSibling);
        } else {
            // Fetch the closest account table wrapper
            insertAfter = target.closest('.recurTransInfoTable');
            // Drop the element at the end of the table
            insertAfter.appendChild(dropped);
        }
    }

    // Update the transaction with the account ID
    function updateTransactionWithRecurrence(recurringTransactionId, recurrence, oldRecurrence) {
        // obtain the transaction id of the table row
        recurringTransactionId = document.getElementById(recurringTransactionId).getAttribute('data-target');
        let recurringTransaction = window.recurringTransactionCache[recurringTransactionId];
        let nextScheduledDate = new Date(recurringTransaction['next_scheduled']);

        let values = {};
        values['recurrence'] = recurrence;
        values['recurringTransactionId'] = recurringTransactionId;
        values['walletId'] = window.currentUser.walletId;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "PATCH";
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.recurringTransactionsAPIUrl;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
            let recurrenceData = result['body-json'];
            // Remove empty entries for the recurrence
            let emptyRecurrenceItem = document.getElementById('emptyRecurrenceItem-' + recurrence);
            if (isNotEmpty(emptyRecurrenceItem)) {
                emptyRecurrenceItem.remove();
            }
            // Replace with Empty Recurrence
            let oldRecurrenceEl = document.getElementById('recurTransSB-' + oldRecurrence);
            let oldRecentTransactionEntry = oldRecurrenceEl.getElementsByClassName('recentTransactionEntry');
            if (oldRecentTransactionEntry.length == 0) {
                // Build empty account entry
                oldRecurrenceEl.appendChild(er_a.buildEmptyTableEntry('emptyRecurrenceItem-' + oldRecurrence));
            }
            // Update Recurrence in the cache
            window.recurringTransactionCache[recurringTransactionId].recurrence = recurrence;
            recurringTransaction = window.recurringTransactionCache[recurringTransactionId];
            // Change the recurrence display
            let recurTransactionEl = document.getElementById('recurTransaction-' + recurringTransactionId);
            let categoryNameRT = recurTransactionEl.getElementsByClassName('categoryNameRT')[0];
            categoryNameRT.textContent = (recurringTransaction.recurrence) + ' • ' + ("0" + nextScheduledDate.getDate()).slice(-2) + ' ' + months[nextScheduledDate.getMonth()].slice(0, 3) + ' ' + nextScheduledDate.getFullYear() + ' ' + ("0" + nextScheduledDate.getHours()).slice(-2) + ':' + ("0" + nextScheduledDate.getMinutes()).slice(-2);
        }
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, 'Unable to change the recurrence. Please try again!', ajaxData);
        }
        $.ajax({
            type: ajaxData.type,
            url: ajaxData.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", authHeader);
            },
            dataType: ajaxData.dataType,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });
    }

    // Populate Empty account entry
    function buildEmptyAccountEntry(accId) {
        let rowEmpty = document.createElement('div');
        rowEmpty.classList = 'd-table-row recentTransactionDateGrp';
        rowEmpty.id = 'emptyAccountEntry-' + accId;

        let cell1 = document.createElement('div');
        cell1.classList = 'd-table-cell align-middle imageWrapperCell text-center';

        let roundedCircle = document.createElement('div');
        roundedCircle.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';
        roundedCircle.appendChild(buildEmptyRecurringTransSvg());
        cell1.appendChild(roundedCircle);
        rowEmpty.appendChild(cell1);

        let cell2 = document.createElement('div');
        cell2.classList = 'descriptionCellRT align-middle d-table-cell text-center';

        let emptyMessageRow = document.createElement('div');
        emptyMessageRow.classList = 'text-center tripleNineColor font-weight-bold';
        emptyMessageRow.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.empty.success : "Oh! Snap! You don't have any transactions yet.";
        cell2.appendChild(emptyMessageRow);
        rowEmpty.appendChild(cell2);

        let cell3 = document.createElement('div');
        cell3.classList = 'descriptionCellRT d-table-cell';
        rowEmpty.appendChild(cell3);

        return rowEmpty;
    }

    // Empty Transactions SVG
    function buildEmptyRecurringTransSvg() {

        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('width', '32');
        svgElement.setAttribute('height', '32');
        svgElement.setAttribute('viewBox', '0 0 64 64');
        svgElement.setAttribute('class', 'align-middle transactions-empty-svg');

        let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement1.setAttribute('d', 'M 5 8 C 3.346 8 2 9.346 2 11 L 2 53 C 2 54.654 3.346 56 5 56 L 59 56 C 60.654 56 62 54.654 62 53 L 62 11 C 62 9.346 60.654 8 59 8 L 5 8 z M 5 10 L 59 10 C 59.551 10 60 10.449 60 11 L 60 20 L 4 20 L 4 11 C 4 10.449 4.449 10 5 10 z M 28 12 C 26.897 12 26 12.897 26 14 L 26 16 C 26 17.103 26.897 18 28 18 L 56 18 C 57.103 18 58 17.103 58 16 L 58 14 C 58 12.897 57.103 12 56 12 L 28 12 z M 28 14 L 56 14 L 56.001953 16 L 28 16 L 28 14 z M 4 22 L 60 22 L 60 53 C 60 53.551 59.551 54 59 54 L 5 54 C 4.449 54 4 53.551 4 53 L 4 22 z');
        svgElement.appendChild(pathElement1);

        let pathElement11 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement11.setAttribute('class', 'coloredTransactionLine');
        pathElement11.setAttribute('d', ' M 8 13 A 2 2 0 0 0 6 15 A 2 2 0 0 0 8 17 A 2 2 0 0 0 10 15 A 2 2 0 0 0 8 13 z');
        svgElement.appendChild(pathElement11);

        let pathElement12 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement12.setAttribute('d', ' M 14 13 A 2 2 0 0 0 12 15 A 2 2 0 0 0 14 17 A 2 2 0 0 0 16 15 A 2 2 0 0 0 14 13 z M 20 13 A 2 2 0 0 0 18 15 A 2 2 0 0 0 20 17 A 2 2 0 0 0 22 15 A 2 2 0 0 0 20 13 z ');
        svgElement.appendChild(pathElement12);

        let pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement2.setAttribute('class', 'coloredTransactionLine');
        pathElement2.setAttribute('d', 'M 11 27.974609 C 10.448 27.974609 10 28.422609 10 28.974609 C 10 29.526609 10.448 29.974609 11 29.974609 L 15 29.974609 C 15.552 29.974609 16 29.526609 16 28.974609 C 16 28.422609 15.552 27.974609 15 27.974609 L 11 27.974609 z M 19 27.974609 C 18.448 27.974609 18 28.422609 18 28.974609 C 18 29.526609 18.448 29.974609 19 29.974609 L 33 29.974609 C 33.552 29.974609 34 29.526609 34 28.974609 C 34 28.422609 33.552 27.974609 33 27.974609 L 19 27.974609 z');
        svgElement.appendChild(pathElement2);

        let pathElement21 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement21.setAttribute('d', ' M 39 27.974609 C 38.448 27.974609 38 28.422609 38 28.974609 C 38 29.526609 38.448 29.974609 39 29.974609 L 41 29.974609 C 41.552 29.974609 42 29.526609 42 28.974609 C 42 28.422609 41.552 27.974609 41 27.974609 L 39 27.974609 z M 45 27.974609 C 44.448 27.974609 44 28.422609 44 28.974609 C 44 29.526609 44.448 29.974609 45 29.974609 L 47 29.974609 C 47.552 29.974609 48 29.526609 48 28.974609 C 48 28.422609 47.552 27.974609 47 27.974609 L 45 27.974609 z M 51 27.974609 C 50.448 27.974609 50 28.422609 50 28.974609 C 50 29.526609 50.448 29.974609 51 29.974609 L 53 29.974609 C 53.552 29.974609 54 29.526609 54 28.974609 C 54 28.422609 53.552 27.974609 53 27.974609 L 51 27.974609 z');
        svgElement.appendChild(pathElement21);

        let pathElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement3.setAttribute('class', 'coloredTransactionLine');
        pathElement3.setAttribute('d', 'M 11 33.974609 C 10.448 33.974609 10 34.422609 10 34.974609 C 10 35.526609 10.448 35.974609 11 35.974609 L 15 35.974609 C 15.552 35.974609 16 35.526609 16 34.974609 C 16 34.422609 15.552 33.974609 15 33.974609 L 11 33.974609 z M 19 33.974609 C 18.448 33.974609 18 34.422609 18 34.974609 C 18 35.526609 18.448 35.974609 19 35.974609 L 33 35.974609 C 33.552 35.974609 34 35.526609 34 34.974609 C 34 34.422609 33.552 33.974609 33 33.974609 L 19 33.974609 z');
        svgElement.appendChild(pathElement3);

        let pathElement31 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement31.setAttribute('d', ' M 45 33.974609 C 44.448 33.974609 44 34.422609 44 34.974609 C 44 35.526609 44.448 35.974609 45 35.974609 L 47 35.974609 C 47.552 35.974609 48 35.526609 48 34.974609 C 48 34.422609 47.552 33.974609 47 33.974609 L 45 33.974609 z M 51 33.974609 C 50.448 33.974609 50 34.422609 50 34.974609 C 50 35.526609 50.448 35.974609 51 35.974609 L 53 35.974609 C 53.552 35.974609 54 35.526609 54 34.974609 C 54 34.422609 53.552 33.974609 53 33.974609 L 51 33.974609 z');
        svgElement.appendChild(pathElement31);

        let pathElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement4.setAttribute('class', 'coloredTransactionLine');
        pathElement4.setAttribute('d', 'M 11 39.974609 C 10.448 39.974609 10 40.422609 10 40.974609 C 10 41.526609 10.448 41.974609 11 41.974609 L 15 41.974609 C 15.552 41.974609 16 41.526609 16 40.974609 C 16 40.422609 15.552 39.974609 15 39.974609 L 11 39.974609 z M 19 39.974609 C 18.448 39.974609 18 40.422609 18 40.974609 C 18 41.526609 18.448 41.974609 19 41.974609 L 33 41.974609 C 33.552 41.974609 34 41.526609 34 40.974609 C 34 40.422609 33.552 39.974609 33 39.974609 L 19 39.974609 z');
        svgElement.appendChild(pathElement4);

        let pathElement41 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement41.setAttribute('d', 'M 39 39.974609 C 38.448 39.974609 38 40.422609 38 40.974609 C 38 41.526609 38.448 41.974609 39 41.974609 L 41 41.974609 C 41.552 41.974609 42 41.526609 42 40.974609 C 42 40.422609 41.552 39.974609 41 39.974609 L 39 39.974609 z M 45 39.974609 C 44.448 39.974609 44 40.422609 44 40.974609 C 44 41.526609 44.448 41.974609 45 41.974609 L 47 41.974609 C 47.552 41.974609 48 41.526609 48 40.974609 C 48 40.422609 47.552 39.974609 47 39.974609 L 45 39.974609 z M 51 39.974609 C 50.448 39.974609 50 40.422609 50 40.974609 C 50 41.526609 50.448 41.974609 51 41.974609 L 53 41.974609 C 53.552 41.974609 54 41.526609 54 40.974609 C 54 40.422609 53.552 39.974609 53 39.974609 L 51 39.974609 z ');
        svgElement.appendChild(pathElement41);

        let pathElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement5.setAttribute('d', 'M 7 48 C 6.448 48 6 48.448 6 49 L 6 51 C 6 51.552 6.448 52 7 52 C 7.552 52 8 51.552 8 51 L 8 49 C 8 48.448 7.552 48 7 48 z M 12 48 C 11.448 48 11 48.448 11 49 L 11 51 C 11 51.552 11.448 52 12 52 C 12.552 52 13 51.552 13 51 L 13 49 C 13 48.448 12.552 48 12 48 z M 17 48 C 16.448 48 16 48.448 16 49 L 16 51 C 16 51.552 16.448 52 17 52 C 17.552 52 18 51.552 18 51 L 18 49 C 18 48.448 17.552 48 17 48 z M 22 48 C 21.448 48 21 48.448 21 49 L 21 51 C 21 51.552 21.448 52 22 52 C 22.552 52 23 51.552 23 51 L 23 49 C 23 48.448 22.552 48 22 48 z M 27 48 C 26.448 48 26 48.448 26 49 L 26 51 C 26 51.552 26.448 52 27 52 C 27.552 52 28 51.552 28 51 L 28 49 C 28 48.448 27.552 48 27 48 z M 32 48 C 31.448 48 31 48.448 31 49 L 31 51 C 31 51.552 31.448 52 32 52 C 32.552 52 33 51.552 33 51 L 33 49 C 33 48.448 32.552 48 32 48 z M 37 48 C 36.448 48 36 48.448 36 49 L 36 51 C 36 51.552 36.448 52 37 52 C 37.552 52 38 51.552 38 51 L 38 49 C 38 48.448 37.552 48 37 48 z M 42 48 C 41.448 48 41 48.448 41 49 L 41 51 C 41 51.552 41.448 52 42 52 C 42.552 52 43 51.552 43 51 L 43 49 C 43 48.448 42.552 48 42 48 z M 47 48 C 46.448 48 46 48.448 46 49 L 46 51 C 46 51.552 46.448 52 47 52 C 47.552 52 48 51.552 48 51 L 48 49 C 48 48.448 47.552 48 47 48 z M 52 48 C 51.448 48 51 48.448 51 49 L 51 51 C 51 51.552 51.448 52 52 52 C 52.552 52 53 51.552 53 51 L 53 49 C 53 48.448 52.552 48 52 48 z M 57 48 C 56.448 48 56 48.448 56 49 L 56 51 C 56 51.552 56.448 52 57 52 C 57.552 52 58 51.552 58 51 L 58 49 C 58 48.448 57.552 48 57 48 z');
        svgElement.appendChild(pathElement5);

        return svgElement;

    }

    function scrollWindow(e) {
        const y = e.pageY; //This collects details on where your mouse is located vertically
        const container = $('.main-panel'); //Replace this with the element class(.) or id(#) that needs to scroll
        const buffer = 200; //You can set this directly to a number or dynamically find some type of buffer for the top and bottom of your page
        const containerBottom = container.offset().top + container.outerHeight(); //Find the bottom of the container
        const containerTop = container.offset().top; //Find the top position of the container
        const scrollPosition = container.scrollTop(); //Find the current scroll position
        const scrollRate = 20; //increase or decrease this to speed up or slow down scrolling

        if (containerBottom - y < buffer) { //If the bottom of the container's position minus y is less than the buffer, scroll down!
            container.scrollTop(scrollPosition + scrollRate);
        } else if (containerTop + y < buffer) { //If the top of the container's position plus y is less than the buffer, scroll up!
            container.scrollTop(scrollPosition - scrollRate);
        }
    }

}(jQuery));
