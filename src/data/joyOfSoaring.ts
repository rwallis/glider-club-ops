/** Media from faultlineflyers.com/the-joy-of-soaring (Google Sites hosted) */

const size = (url: string, width = 1200) =>
  url.includes('=') ? url.replace(/=w\d+$/, `=w${width}`) : `${url}=w${width}`

const rawImages = [
  'https://lh3.googleusercontent.com/sitesv/AA5AbUDCioiPD69X5XGrnzNem0-4k-1x8uzkQj7Ga7vy6_6iytbH2PuRcliqGk8_0QwtIVRUJ6R9BR7toqzqhzT0BbdWK3WFWWURFfJNnNl4Vag0W0MnG1bFv_o-F1-hv2mzVngvWfEpOSQPXMIaSWhaZyVDmx2CZymNJDyIkfg=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUAOj1uKsrWJ3iLKxy1TUA2PUbxMMX0SDcjCTJced-NMpdJW8VRWa3AWgBAmOF_WQg0LFnfnvcingd8nr_Woum6DjxWdeoftbFo20Vlup81J5bPDdam3ecx8iXQf8ojUX5vInKLk8L7eqpdJkBFGG9tN0k_ILFKM236LTME=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUBGF8qSXV4cOV5vXVb7ia9vWGcO9X7hgbS73VwnPPLlQeOlk4kDUukIftpqbrn4rDuzLDSo9S8=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUCimfxbFBe6vpvug6neSwID_OUFS24TQGrK9UDsBnqgSJioCVtEv-op31IPin-Yrhou-6ku53X=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUD7EeD6WMae1RDExQngSHARSGbosjspsytiPa2FtCpFFNP3MVo4x2o455E_uq_iZYYP4yTWn8j=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUBopcwLBO42eQmNi7Nl2EMJ3-Myp-xxI_DUHgIqHCtSN07SjPmCmTkVYRAvn3lHi2gohwyjX2p=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUA2XV2hsefpLWS5MfRR887kE9jJWaVbu61EkD2I_es2wXlz1hqI-aSmRTtvQE2W4acuRmjfJ6I=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUBaO4cJZuKI84aBHu2RwRold69N0Q35fGbMipSkj5R4HW8KJlT99D7mUXqvcDyHyzaNP6tj9i9=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUCypdyxx-IiQ_L8o9JBOqqhujE57ILgyxx9-FaAdUgRQ2AcpB6wdaUH68073iE3_nSnCS-sByu=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUDm25to3b_9s3dHj2iIO7chOhXL3ESuWszY1M_RO2wqTnKfYKjHPn0VR9R0_ml7OFyjcLZo5Dx=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUAywYFdYuBxguWqNAWBdNoJu4eB5VoH8hAoptxpLQD_gC2i-cg_kkH1Uqz8IRAfgOtFmCW01ez=w16383',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUDRDSPTQzT8FtzwBlDdIs1qstfi9q0c3H4LZ99oo_gUolpIg3eJNbnaW2T_jkkX2OdZJ80rOO3=w16383',
] as const

export const JOY_OF_SOARING_VIDEO = {
  embedUrl: 'https://www.youtube.com/embed/AS_nMtm4esY',
  title: 'The joy of soaring at Fault Line Flyers',
} as const

export const JOY_OF_SOARING_QUOTE = {
  text: 'More than anything else the sensation is one of perfect peace mingled with an excitement that strains every nerve to the utmost, if you can conceive of such a combination.',
  author: 'Wilbur Wright',
} as const

export const joyOfSoaringImages = rawImages.map((url, i) => ({
  id: `joy-${i + 1}`,
  src: size(url),
  thumb: size(url, 600),
  alt: `Fault Line Flyers soaring — photo ${i + 1}`,
})) as ReadonlyArray<{ id: string; src: string; thumb: string; alt: string }>

/** Bento grid layout hints: tall, wide, or default */
export const joyGalleryLayout = [
  'tall',
  'wide',
  'default',
  'default',
  'tall',
  'wide',
  'default',
  'default',
  'tall',
  'default',
  'wide',
  'default',
] as const
