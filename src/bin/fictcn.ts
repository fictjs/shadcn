#!/usr/bin/env node

import { main } from '../cli/main'
import { handleCliError } from '../cli/error'

void main(process.argv).catch(handleCliError)
