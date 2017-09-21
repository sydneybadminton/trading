#!/bin/bash
day=$(TZ="Australia/Sydney" date +%A)
hour=$(TZ="Australia/Sydney" date +%H)
minute=$(TZ="Australia/Sydney" date +%M)

#if [[ $day == "Saturday" && $hour == 08 ]];
#then
#    echo "Running run_saturday_expense.py" >> ${OPENSHIFT_LOG_DIR}/hourly.log
#    python ${OPENSHIFT_REPO_DIR}/scripts/run_saturday_expense.py
#el
if [[ $day == "Sunday" && $hour == 09 ]];
then
    echo "Running run_sunday_expense.py" >> ${OPENSHIFT_LOG_DIR}/hourly.log
    python ${OPENSHIFT_REPO_DIR}/scripts/run_sunday_expense.py
elif [[ $day == "Monday" && $hour == 10 ]];
then
    echo "Running run_low_balance_notif.py" >> ${OPENSHIFT_LOG_DIR}/hourly.log
    python ${OPENSHIFT_REPO_DIR}/scripts/run_low_balance_notif.py
else
    echo $day >> ${OPENSHIFT_LOG_DIR}/hourly.log
    echo $hour >> ${OPENSHIFT_LOG_DIR}/hourly.log
    echo $minute >> ${OPENSHIFT_LOG_DIR}/hourly.log
fi;