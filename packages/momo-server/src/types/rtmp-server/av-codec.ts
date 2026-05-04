export interface IAACInfo {
  object_type: number;
  sample_rate: number;
  chan_config: number;
  channels?: number;
  sbr: number;
  ps: number;
  sampling_index?: number;
  ext_object_type?: number;
  [key: string]: unknown;
}

export interface IAVCInfo {
  width: number;
  height: number;
  profile: number;
  level: number;
  compat?: number;
  nalu?: number;
  nb_sps?: number;
  avc_ref_frames?: number;
  [key: string]: unknown;
}

export interface IHEVCPtlInfo {
  profile_space: number;
  tier_flag: number;
  profile_idc: number;
  profile_compatibility_flags: number;
  general_progressive_source_flag: number;
  general_interlaced_source_flag: number;
  general_non_packed_constraint_flag: number;
  general_frame_only_constraint_flag: number;
  level_idc: number;
  sub_layer_profile_present_flag: number[];
  sub_layer_level_present_flag: number[];
  sub_layer_profile_space: number[];
  sub_layer_tier_flag: number[];
  sub_layer_profile_idc: number[];
  sub_layer_profile_compatibility_flag: number[];
  sub_layer_progressive_source_flag: number[];
  sub_layer_interlaced_source_flag: number[];
  sub_layer_non_packed_constraint_flag: number[];
  sub_layer_frame_only_constraint_flag: number[];
  sub_layer_level_idc: number[];
}

export interface IHEVCSpsInfo {
  sps_video_parameter_set_id?: number;
  sps_max_sub_layers_minus1?: number;
  sps_temporal_id_nesting_flag?: number;
  profile_tier_level?: IHEVCPtlInfo;
  sps_seq_parameter_set_id?: number;
  chroma_format_idc?: number;
  separate_colour_plane_flag?: number;
  pic_width_in_luma_samples: number;
  pic_height_in_luma_samples: number;
  conf_win_left_offset?: number;
  conf_win_right_offset?: number;
  conf_win_top_offset?: number;
  conf_win_bottom_offset?: number;
  [key: string]: unknown;
}

export interface IHEVCInfo {
  configurationVersion?: number;
  general_profile_space?: number;
  general_tier_flag?: number;
  general_profile_idc?: number;
  general_profile_compatibility_flags?: number;
  general_constraint_indicator_flags?: number;
  general_level_idc?: number;
  min_spatial_segmentation_idc?: number;
  parallelismType?: number;
  chromaFormat?: number;
  bitDepthLumaMinus8?: number;
  bitDepthChromaMinus8?: number;
  avgFrameRate?: number;
  constantFrameRate?: number;
  numTemporalLayers?: number;
  temporalIdNested?: number;
  lengthSizeMinusOne?: number;
  psps?: IHEVCSpsInfo;
  [key: string]: unknown;
}
