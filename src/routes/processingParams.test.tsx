
import { ProcessingDetails } from 'utils/types'
import { nameLabelMap } from './nameLabelMap'
import { ProcessingTable, getStartExtraRows } from './ProcessingParameters'

describe('getStartExtraRows', () => {
    it('should extract relion and feedback rows correctly', () => {
        nameLabelMap.set('threshold', 'Threshold') // mock mapping

        const procParams: ProcessingDetails[] = [
            {
                relion_params: {
                    dose_per_frame: 0.5,
                    pj_id: 123,
                    angpix: 0,
                    voltage: 0,
                    motion_corr_binning: 0,
                    symmetry: '',
                    downscale: false
                },
                feedback_params: {
                    estimate_particle_diameter: true,
                    pj_id: 456,
                    class_selection_score: 0,
                    star_combination_job: 0,
                    initial_model: '',
                    next_job: 0
                },
                data_collection_group: {
                    id: 0,
                    session_id: 0,
                    tag: '',
                    atlas_id: undefined,
                    atlas_pixel_size: undefined,
                    atlas: undefined,
                    sample: undefined
                },
                data_collections: [],
                processing_jobs: []
            },
        ]

        const tableRows: ProcessingTable[] = []

        const result = getStartExtraRows(procParams, tableRows)

        // todo make tests work
        expect(tableRows).toEqual([
            {
                tag: '123',
                processingRows: [
                    {
                        parameterName: 'Threshold',
                        parameterValue: 0.5,
                    },
                ],
            },
        ])

        expect(result).toEqual([
            {
                tag: '456',
                processingRows: [
                    {
                        parameterName: 'Threshold',
                        parameterValue: 'True',
                    },
                ],
            },
        ])
    })

    it('should return empty arrays when procParams is null', () => {
        const result = getStartExtraRows(null, [])
        expect(result).toEqual([])
    })
})
