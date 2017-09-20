#!/bin/bash

echo "Running run_comparison.py" >> ${OPENSHIFT_LOG_DIR}/minutely.log
python ${OPENSHIFT_REPO_DIR}/scripts/run_comparison.py
