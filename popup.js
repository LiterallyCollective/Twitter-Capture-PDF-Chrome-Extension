'use strict';

var PAYMENT_URL = "http://52.68.239.201";

function showWarning(strMsg) {
    $('.input-warning').removeClass('d-none');
    $('.input-warning p').html(strMsg);
    setTimeout(function () {
        hideWarning();
    }, 3000);
}

function hideWarning() {
    $('.input-warning').addClass('d-none');
}

function showPaymentWarning(strMsg) {
    $('.payment-warning').removeClass('d-none');
    $('.payment-warning p').html(strMsg);
    setTimeout(function () {
        hidePaymentWarning();
    }, 3000);
}

function hidePaymentWarning() {
    $('.input-warning').addClass('d-none');
}

function showInformation(strMsg) {
    $('.input-information').removeClass('d-none');
    $('.input-information p').html(strMsg);
    setTimeout(function () {
        hideInformation();
    }, 3000);
}

function hideInformation() {
    $('.input-information').addClass('d-none');
}


function add_daily_account(account_name, layout_index) {
    chrome.storage.sync.get('twitter_capture_daily_account', function (result) {
        var daily_account_list = result['twitter_capture_daily_account'];
        if (!daily_account_list) {
            daily_account_list = [];
        }
        var daily_account = {
            id: new Date().getTime(),
            account_name: account_name,
            layout_index: layout_index,
            lastest_capture: null
        }
        daily_account_list.push(daily_account);
        chrome.storage.sync.set({'twitter_capture_daily_account': daily_account_list}, function () {
            refresh_daily_account_table();
            showInformation("Daily Schedule Added Successfully!");
        });
    });
}

function add_process(account_name, from_date, until_date, layout_index) {
    chrome.storage.sync.get('twitter_capture_process', function (result) {
        var process_list = result['twitter_capture_process'];
        if (!process_list) {
            process_list = [];
        }
        var process = {
            id: new Date().getTime(),
            account_name: account_name,
            layout_index: layout_index,
            from_date: from_date,
            until_date: until_date,
            status: "Waiting"
        }
        process_list.push(process);
        chrome.storage.sync.set({'twitter_capture_process': process_list}, function () {
            refresh_process_table();
            showInformation("Capture Process Added Successfully!");
        });
    });
}

function refresh_daily_account_table() {
    chrome.storage.sync.get('twitter_capture_daily_account', function (result) {
        var daily_account_list = result['twitter_capture_daily_account'];
        if (!daily_account_list) {
            daily_account_list = [];
        }

        $('#daily-account-content').empty();
        for (var daily_account of daily_account_list) {
            var daily_account_html = '<tr id="' + daily_account.id + '">' +
                '<td>@' + daily_account.account_name + '</td>' +
                '<td>' + daily_account.lastest_capture + '</td>' +
                '<td><button class="btn btn-sm btn-dark py-0 remove-daily-account" data-id="' + daily_account.id + '"><span aria-hidden="true">&times;</span> Remove</button></td>' +
                '</tr>';
            $('#daily-account-content').append(daily_account_html);
        }

        $('.remove-daily-account').click(function () {
            var id = $(this).attr('data-id');
            removeDailyAccount(id);
        });
    });
}

function refresh_process_table() {
    chrome.storage.sync.get('twitter_capture_process', function (result) {
        var process_list = result['twitter_capture_process'];
        if (!process_list) {
            process_list = [];
        }

        $('#process-content').empty();
        for (var process of process_list) {
            var process_html = '<tr id="' + process.id + '">' +
                '<td>@' + process.account_name + '</td>' +
                '<td>' + process.from_date + ' ~ ' + process.until_date + '</td>' +
                '<td>' + process.status + '</td>' +
                '<td><button class="btn btn-sm btn-dark py-0 remove-process" data-id="' + process.id + '"><span aria-hidden="true">&times;</span> Remove</button></td>' +
                '</tr>';
            $('#process-content').append(process_html);
        }

        $('.remove-process').click(function () {
            var id = $(this).attr('data-id');
            removeProcess(id);
        });
    });
}

function removeDailyAccount(id) {
    chrome.storage.sync.get('twitter_capture_daily_account', function (result) {
        var daily_account_list = result['twitter_capture_daily_account'];
        if (!daily_account_list) {
            return;
        }

        for (var i = daily_account_list.length - 1; i >= 0; i--) {
            if (daily_account_list[i].id == id || daily_account_list[i].id == undefined) {
                daily_account_list.splice(i, 1);
            }
        }
        chrome.storage.sync.set({'twitter_capture_daily_account': daily_account_list}, function () {
            refresh_daily_account_table();
            showInformation("Daily Schedule Removed Successfully!");
        });
    });
}

function removeProcess(id) {
    chrome.storage.sync.get('twitter_capture_process', function (result) {
        var process_list = result['twitter_capture_process'];
        if (!process_list) {
            return;
        }

        for (var i = process_list.length - 1; i >= 0; i--) {
            if (process_list[i].id == id || process_list[i].id == undefined) {
                process_list.splice(i, 1);
            }
        }
        chrome.storage.sync.set({'twitter_capture_process': process_list}, function () {
            refresh_process_table();
            showInformation("Process Removed Successfully!");
        });
    });
}

$(document).ready(function () {
    chrome.storage.sync.get('twitter_capture_payment_id', function (result) {
        var sessionId = result['twitter_capture_payment_id'];
        if (sessionId) {
            fetch(PAYMENT_URL + '/checkout-session?sessionId=' + sessionId)
                .then(function (result) {
                    return result.json();
                })
                .then(function (reply) {
                    if (reply.status == "success" && reply.data.payment_status == "paid") {
                        $('.loading-panel').addClass('d-none');
                        $('.payment-detail').addClass('d-none');
                        $('.account-detail').removeClass('d-none');
                    } else {
                        $('.loading-panel').addClass('d-none');
                        $('.payment-detail').removeClass('d-none');
                        $('.account-detail').addClass('d-none');
                        chrome.tabs.create({url: PAYMENT_URL, active: false});
                    }
                })
                .catch(function (err) {
                    console.log('Error when fetching Checkout session', err);
                    $('.loading-panel').addClass('d-none');
                    $('.payment-detail').removeClass('d-none');
                    $('.account-detail').addClass('d-none');
                    chrome.tabs.create({url: PAYMENT_URL, active: false});
                });
        } else {
            $('.loading-panel').addClass('d-none');
            $('.payment-detail').removeClass('d-none');
            $('.account-detail').addClass('d-none');
            chrome.tabs.create({url: PAYMENT_URL, active: false});
        }
    });


    refresh_daily_account_table();
    refresh_process_table();

    $('.pdf-layout').click(function () {
        $('.active-layout').removeClass('active-layout');
        $(this).addClass('active-layout');
        $('#layout-index').val($(this).attr('layout-index'));
    })

    $('#btn-add').click(function () {
        var account_name = $('#account-name').val();
        var from_date = $('#from-date').val();
        var until_date = $('#until-date').val();
        var auto_capture = $('#auto-capture').prop('checked');
        var layout_index = $('#layout-index').val();

        var bValid = false;
        if (!account_name) {
            showWarning('*** Please input account name! ***');
        } else if (!auto_capture) {
            if (!from_date || !until_date) {
                showWarning('*** Please input from date and until date! ***');
            } else if (new Date(from_date) > new Date(until_date)) {
                showWarning('*** from date should be ealier than until date! ***');
            } else {
                hideWarning();
                bValid = true;
            }
        } else {
            hideWarning();
            bValid = true;
        }

        if (!bValid) return;

        if (auto_capture) {
            add_daily_account(account_name, layout_index);
        } else {
            add_process(account_name, from_date, until_date, layout_index);
        }
        $('#account-name').val("");
    });

    $('#auto-capture').change(function () {
        if (this.checked) {
            $('#period').hide();
        } else {
            $('#period').show();
        }
    });

    $('#btn-confirm-payment').click(function () {
        var sessionId = $('#payment-id').val();

        if (sessionId) {
            fetch(PAYMENT_URL + '/checkout-session?sessionId=' + sessionId)
                .then(function (result) {
                    return result.json();
                })
                .then(function (reply) {
                    if (reply.status == "success" && reply.data.payment_status == "paid") {
                        chrome.storage.sync.set({'twitter_capture_payment_id': sessionId}, function () {
                            $('.loading-panel').addClass('d-none');
                            $('.payment-detail').addClass('d-none');
                            $('.account-detail').removeClass('d-none');
                        });
                    } else {
                        showPaymentWarning('Please input payment ID correctly.');
                    }
                })
                .catch(function (err) {
                    console.log('Error when fetching Checkout session', err)
                    showPaymentWarning('Please input payment ID correctly.');
                });
        } else {
            showPaymentWarning('Please input payment ID correctly.');
        }
    });
});