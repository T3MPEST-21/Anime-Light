import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { radius, second } from '@/constants/theme'
import { hp, wp } from '@/helpers/common'
import Header from '@/components/Header'

const EditProfile = () => {
  return (
    <View>
      <View style={styles.container}>
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          <Header title="Edit Profile" ShowBackButton={true} marginBottom={hp(2)} />
        </ScrollView>
      </View>
    </View>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    borderWidth: .4,
    borderColor: second.text,
    borderRadius: radius.xxl,
    padding:17,
    paddingHorizontal: 20,
    gap: 5,
    borderCurve: 'continuous',
  },
  bio: {
    flexDirection: 'row',
    height: hp(15),
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  form: {
    gap:18,
    marginTop: 20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: second.darkLight,
    shadowColor: second.text,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: .4,
    shadowRadius: 5,
    elevation: 7,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderColor: second.darkLight,
    borderWidth: 1,
  },
  avatarContainer: {
    width: hp(14),
    height: hp(14),
    alignSelf: 'center',
  },
  container: {
    flex: 1, 
    paddingHorizontal: wp(4),
    backgroundColor: second.primarySecond,
  }
})