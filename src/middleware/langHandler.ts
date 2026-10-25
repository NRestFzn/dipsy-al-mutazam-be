import { NextFunction, Request, Response } from 'express'
import { defaultLang, locales, SupportedLanguage } from '../locales'
import { env } from '../config/env.config'

export const langHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headerLang =
    env.APP_LANG || req.headers['x-lang'] || req.headers['accept-language']

  const langCode = (
    Array.isArray(headerLang) ? headerLang[0] : headerLang
  )?.substring(0, 2)

  const isSupported = langCode && Object.keys(locales).includes(langCode)

  const finalLang = (isSupported ? langCode : defaultLang) as SupportedLanguage

  req.t = locales[finalLang]
  req.lang = finalLang

  next()
}
